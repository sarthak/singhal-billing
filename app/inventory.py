import flask
from . import dbutils

inventory_bp = flask.Blueprint('inventory', __name__)


@inventory_bp.route('/')
def inventorypage():
    return flask.render_template('inventory.html',
            css=flask.url_for('static', filename='css'),
            js=flask.url_for('static', filename='js'))

@inventory_bp.route('/api/list')
def list_all():
    products = []
    conn = dbutils.connect_db()
    with conn:
        curr = conn.execute(
            'select * from inventory order by name;')
        while True:
            prod = curr.fetchone()
            if not prod:
                break
            products.append({
                'name': prod['name'],
                'price': prod['price'],
                'discount': prod['discount']
            })
    conn.close()
    return flask.json.jsonify(products)

@inventory_bp.route('/api/save', methods=['POST'])
def save_changes():
    req = flask.request.json
    conn = dbutils.connect_db()
    curr = conn.cursor()
    try:
        for updated in req['updated']:
            curr.execute(
                'update inventory '
                'set price=?, discount=? where name=?',
                (updated['price'], updated['discount'],
                 updated['name']))

        for inserted in req['inserted']:
            curr.execute(
                'insert into inventory values (?, ?, ?)',
                (inserted['name'], inserted['price'],
                 inserted['discount']))

        for deleted in req['deleted']:
            print(deleted)
            curr.execute(
                'delete from inventory where name=?',
                (deleted['name'],))

        conn.commit()

    except dbutils.DatabaseError as e:
        conn.rollback()
        return flask.json.jsonify({'errormsg': repr(e)}), 400
    finally:
        curr.close()
        conn.close()

    return 'Success', 200
