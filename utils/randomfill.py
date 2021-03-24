import sqlite3
import random
from datetime import datetime, timedelta

products = ['elbow', 'socket', 'tee', 'tiles', 'pipes', 'joint', 'glue']
names = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6']

def randomdate(start, end):
    delta = end - start
    int_delta = (delta.days * 24 * 60 * 60) + delta.seconds
    random_second = random.randrange(int_delta)
    date = start + timedelta(seconds=random_second)
    return date.isoformat()

bills = []
for i in range(1000, 50000):
    total = 0
    items = []
    for j in range(random.randrange(5, 50)):
        name = random.choice(products)
        price = random.randrange(10, 500)
        discount = random.randrange(0, 10)
        qty = random.randrange(1, 10)
        total += price * qty * (100 - discount)/100
        items.append((name, price, discount, qty))

    extradiscount = random.randrange(0, 25)
    freightcharges = random.randrange(0, 1000)
    extracharges = random.randrange(0, 500)
    total = total * (100 -extradiscount)/100 + freightcharges + extracharges

    bills.append((
        i,
        random.choice(names),
        '',
        randomdate(datetime.fromisoformat('2021-01-01T00:00:00'),
            datetime.fromisoformat('2021-03-24T00:00:00')),
        extradiscount,
        freightcharges,
        extracharges,
        items,
        total
        ))

def bill_yielder():
    for bill in bills:
        yield (
            bill[0], bill[1], bill[2], bill[3], bill[4], bill[5],
            bill[6], bill[8])

def items_yielder():
    for bill in bills:
        for item in bill[7]:
            yield (
                bill[0],
                item[0], item[1], item[2], item[3])

print('Generated Data!')

conn = sqlite3.connect('./db/data.db')
cur = conn.cursor()

try:
    cur.executemany('insert into bills values '
        '(?, ?, ?, ?, ?, ?, ?, ?)', bill_yielder())
    cur.executemany('insert into bills_data values '
        '(?, ?, ?, ?, ?)', items_yielder())
    conn.commit()
except sqlite3.DatabaseError as e:
    conn.rollback()
    print(repr(e))
finally:
    cur.close()
    conn.close()
