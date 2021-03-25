export BILLING_DB_PATH=./db/data.db
export BILLING_BACKUP_PATH=./db/backup
waitress-serve --call 'app:create_app'
