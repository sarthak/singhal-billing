import flask
from . import dbutils
from pathlib import Path

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
