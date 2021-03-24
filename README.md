# singhal-billing
A simple billing system / invoice generator for small businesses.
Made this specifically for my father's business (hence the name) so features are highly-customized.
The only reason I am making the repo public is so that I can easily clone the repo on my father's machine (without entering my github credentials :p).
The expected usage is that server and database will run *only* locally and only one client will access at a time.
Therefore, the code is most likely ripe with sql-injection vulnerabilities and database synchronization is minimal.
Database size is unlikely to exceed a few hunder MBs so sqlite will suffice.

The front-end is minimal mostly vanilla html with light css. JS is also vanilla (no libraries/deps).
The back-end is written in flask (python3) and the database is sqlite3 (because it is serverless)

There are 3 screens - billing, inventory and bills.
The billing screen as the name suggests is used for generating bills/invoices.
The browser's in-built print functionality can be used to render the bill into pdf. CSS is customized for printing.

Inventory screen is used to maintain the inventory, basically the list of products that are in stock along with their MRP, Discount etc.
Details filled in the inventory can be used to auto-fill in the billing screen. Except for auto-filling there is no use of maintaining inventory.

Bills screen can be used to filter/browse the saved bills, edit them or view them.

The full database schema can be found in `app/sql/init.sql`.

I am planning to also add a backup screen to maintain db backups.

## Setup instructions
Here `python` is alias for `python3` >= 3.7
```
python -m venv env/
source env/bin/activate  <-- this line will be different on windows/mac
python -m pip install flask waitress
mkdir db/ && python utils/dbinit.py
```

Finally the server can be started by either the `debug.sh` script which starts a flask-development server,
or, it can be started with `run.sh` script which starts a production server using waitress.

API endpoints are NOT protected so in any case we should not host the server online.
