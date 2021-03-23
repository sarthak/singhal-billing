import flask
from . import dbutils

billing_bp = flask.Blueprint('billing', __name__)


@billing_bp.route('/')
def hello():
    print(flask.request.args)
    return flask.render_template('index.html',
            css=flask.url_for('static', filename='css'),
            js=flask.url_for('static', filename='js'))


@billing_bp.route('/api/billno', methods=['GET'])
def billno():
    conn = dbutils.connect_db()
    cur = conn.execute('select coalesce(max(bill_id), 0) as billno from bills;')
    billno = cur.fetchone()['billno']
    conn.close()
    return {
        'billno': billno+1
    }


@billing_bp.route('/api/save', methods=['POST'])
def save():
    req = flask.request.json
    conn = dbutils.connect_db()
    
    if req['overwrite']:
        # Client has explicity asked to overwrite the bill
        cur = conn.cursor()
        try:
            cur.execute('select bill_id from bills '
                'where bill_id = ?', (req['billno'],))
            if cur.fetchall():
                # Bill was already in the database:
                cur.execute('delete from bills '
                    'where bill_id = ?', (req['billno'],))
                cur.execute('delete from bills_data '
                    'where bill_id = ?', (req['billno'],))
                conn.commit()
        except dbutils.DatabaseError as e:
            conn.rollback()
            return {
                'errormsg': repr(e)
            }, 400
        finally:
            cur.close()

    cur = conn.cursor()
    try:
        cur.execute('insert into bills values '
            '(?, ?, ?, ?, ?, ?, ?, ?)', (
                req['billno'], req['customer_name'],
                req['customer_mobile'], req['date'],
                req['extradiscount'], req['freightcharges'],
                req['extracharges'], req['total'])
        )
        for purchase in req['purchases']:
            cur.execute('insert into bills_data values '
                '(?, ?, ?, ?, ?)', (
                    req['billno'],
                    purchase['name'], purchase['price'],
                    purchase['discount'], purchase['qty'])
            )

        conn.commit()

    except dbutils.DatabaseError as e:
        conn.rollback()
        return {
            'errormsg': repr(e)
        }, 400

    finally:
        cur.close()
        conn.close()

    return 'Success', 200
