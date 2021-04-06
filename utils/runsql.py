import sqlite3
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('sql')
args = parser.parse_args()

conn = sqlite3.connect('db/data.db')
with open(args.sql, 'r') as scriptfile:
    script = scriptfile.read()
try:
    cur = conn.executescript(script)
    print(cur.fetchall())
    cur.close()
    conn.commit()
except sqlite3.DatabaseError as e:
    conn.rollback()
    print(repr(e))
finally:
    conn.close()
