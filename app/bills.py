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
