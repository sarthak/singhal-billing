import os
import sqlite3

DB_PATH = os.getenv('BILLING_DB_PATH', './db/data.db')
BACKUP_PATH = os.getenv('BILLING_BACKUP_PATH', './db/backup/')
DatabaseError = sqlite3.DatabaseError

def connect_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def try_backup(path):
    conn = connect_db()
    try:
        conn2 = sqlite3.connect(path)
        conn.backup(conn2)
        conn2.close()
        return '', 200
    except DatabaseError as e:
        return {
            'errormsg': repr(e)
        }, 400
    finally:
        conn.close()
