export FLASK_APP=app
export FLASK_ENV=development
export BILLING_DB_PATH=./db/data.db
export BILLING_BACKUP_PATH=./db/backup
python -m flask run
