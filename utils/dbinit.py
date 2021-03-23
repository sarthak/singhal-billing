import sqlite3

conn = sqlite3.connect('db/data.db')
with open('app/sql/init.sql') as initfile:
    initscript = initfile.read()
conn.executescript(initscript)
conn.commit()
conn.close()
