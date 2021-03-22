import os
import sqlite3

DB_PATH = os.getenv('BILLING_DB_PATH', './db/data.db')
DatabaseError = sqlite3.DatabaseError

def connect_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn
