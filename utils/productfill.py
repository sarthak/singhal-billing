import sqlite3

conn = sqlite3.connect('db/data.db')

with open('inventory.csv', 'r') as inventory:
    try:
        cur = conn.cursor()
        for item in inventory.readlines():
            item = item.strip()
            if item.startswith('"'):
                item = item[1:-1]
            item = item.replace('""', '"')
            cur.execute('insert into inventory values (?, 0, 0);', (item,))
        conn.commit()
    except Exception as e:
        print(repr(e))
        conn.rollback()
    finally:
        cur.close()
        conn.close()
