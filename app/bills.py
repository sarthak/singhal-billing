import flask
from . import dbutils

bills_bp = flask.Blueprint('bills', __name__)

@bills_bp.route('/')
def main():
    return flask.render_template('bills.html',
            css=flask.url_for('static', filename='css'),
            js=flask.url_for('static', filename='js'))

@bills_bp.route('/api/list', methods=['GET', 'PUT'])
def search():
    req = flask.request.json
    wherestring = ''
    params = []
    if len(req['queries']) > 0:
        q = req['queries'][0]
        wherestring = (f"WHERE ({q['attribute']} "
            f"{q['operator']} ?)")
        params.append(q['value'])
        for q in req['queries'][1:]:
            wherestring += (f"AND ({q['attribute']} "
                f"{q['operator']} ?)")
            params.append(q['value'])

    conn = dbutils.connect_db()
    cur = conn.cursor()
    try:
        cur.execute('select '
            'bill_id, date, customer_name, customer_mobile, '
            'total from bills ' + wherestring +
            f" order by {req['orderby']['orderby']} "
            f"{req['orderby']['orderasc']}", tuple(params))

        rows = []
        for row in cur.fetchall():
            rows.append(
                {
                    'billno': row['bill_id'],
                    'date': row['date'],
                    'customername': row['customer_name'],
                    'customermobile': row['customer_mobile'],
                    'total': row['total']
                }
            )
        return flask.json.jsonify(rows), 200
    except dbutils.DatabaseError as e:
        conn.rollback()
        return {
            'errormsg': repr(e)
        }
    finally:
        cur.close()
        conn.close()

@bills_bp.route('/api/bill/<billno>')
def get_bill(billno):
    bill = {}
    conn = dbutils.connect_db()
    try:
        cur = conn.execute('select * from bills '
                'where bill_id=?;', (billno,))
        row = cur.fetchone()
        if not row:
            raise dbutils.DatabaseError('Bill No. not exists')
        bill['billno'] = row['bill_id']
        bill['date'] = row['date']
        bill['customername'] = row['customer_name']
        bill['customermobile'] = row['customer_mobile']
        bill['freightcharges'] = row['freightcharges']
        bill['extradiscount'] = row['extradiscount']
        bill['extracharges'] = row['extracharges']
        bill['total'] = row['total']
        bill['purchases'] = []

        cur.execute('select * from bills_data '
            'where bill_id=?;', (billno,))
        rows = cur.fetchall()
        for row in rows:
            purchase = {}
            purchase['name'] = row['name']
            purchase['price'] = row['price']
            purchase['discount'] = row['discount']
            purchase['qty'] = row['qty']
            bill['purchases'].append(purchase)

        cur.close()
        return bill, 200

    except dbutils.DatabaseError as e:
        return {
                'errormsg': repr(e)
            }, 400

    finally:
        conn.close()

@bills_bp.route('/api/delete', methods=['POST'])
def delete_bills():
    req = flask.request.json
    def billnos():
        for billno in req['billnos']:
            yield (billno,)

    conn = dbutils.connect_db()
    cur = conn.cursor()
    try:
        cur.executemany('delete from bills where bill_id=?',
                billnos())
        cur.executemany('delete from bills_data where bill_id=?',
                billnos())
        conn.commit()
        return 'Success', 200
    except dbutils.DatabaseError as e:
        conn.rollback()
        return {
            'errormsg': repr(e)
            }, 200
    finally:
        cur.close()
        conn.close()
