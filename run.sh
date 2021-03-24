export BILLING_DB_PATH=./db/data.db
waitress-serve --call 'app:create_app'
