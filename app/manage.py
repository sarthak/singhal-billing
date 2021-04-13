import flask
from . import dbutils
from pathlib import Path
from shutil import copyfile

manage_bp = flask.Blueprint('manage', __name__)

@manage_bp.route('/')
def main():
    return flask.render_template('manage.html',
            css=flask.url_for('static', filename='css'),
            js=flask.url_for('static', filename='js'))

@manage_bp.route('/api/dbinfo')
def dbinfo():
    path = Path(dbutils.DB_PATH)
    backpath = Path(dbutils.BACKUP_PATH)
    size = path.stat().st_size / (1024 * 1024)
    conn = dbutils.connect_db()
    try:
        cur = conn.execute('pragma integrity_check;')
        result = cur.fetchone()['integrity_check']
        cur.close()
        if result == 'ok':
            return {
                'location': str(path),
                'size': size,
                'health': 'ok',
                'backuplocation': str(backpath)
            }, 200
        raise dbutils.DatabaseError('err')
    except dbutils.DatabaseError as e:
        return {
            'location': str(path),
            'size': size,
            'health': 'corrupted!',
            'backuplocation': str(backpath)
            }, 200
    finally:
        conn.close()

@manage_bp.route('/api/backup', methods=['POST'])
def backup():
    req = flask.request.json
    path = Path(dbutils.BACKUP_PATH).joinpath(f'{req["name"]}.db')
    return dbutils.try_backup(path)

@manage_bp.route('/api/list', methods=['GET'])
def list():
    path = Path(dbutils.BACKUP_PATH)
    backups = []
    for file in path.iterdir():
        if file.is_file():
            backups.append({
                'name': file.stem,
                'size': file.stat().st_size / (1 << 20)
            })
    return flask.json.jsonify(backups), 200

@manage_bp.route('/api/delete', methods=['POST'])
def delete():
    req = flask.request.json
    path = Path(dbutils.BACKUP_PATH).joinpath(f'{req["name"]}.db')
    if path.exists():
        path.unlink()
        return '', 200
    else:
        return {
            'errormsg': 'No such backup'
        }, 400

@manage_bp.route('/api/restore', methods=['POST'])
def restore():
    req = flask.request.json
    path = Path(dbutils.BACKUP_PATH).joinpath(f'{req["name"]}.db')
    dbpath = Path(dbutils.DB_PATH)
    if not path.exists():
        return {
            'errormsg': 'Backup does not exist'
        }, 400
    if dbpath.exists():
        dbpath.unlink()

    copyfile(path, dbpath)
    return '', 200
