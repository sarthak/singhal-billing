drop table if exists inventory;
drop table if exists bills;
drop table if exists bills_data;

create table inventory (
  name text primary key,
  price real,
  discount real default 0.0
);

create table bills (
  bill_id int primary key,
  customer_name text,
  customer_mobile text,
  date text,
  freightcharges real,
  deposited real,
  total real
);

create table bills_data (
  bill_id int references bills(bill_id),
  name text,
  price real,
  discount real,
  qty int
);

create index billsdata_index on bills_data (bill_id);

insert into inventory values
  ('elbow', 120.0, 5.0),
  ('tee', 180.0, 15),
  ('socket', 35.0, 20)
;
