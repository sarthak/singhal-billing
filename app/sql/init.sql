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
  customer text,
  date text
);

create table bills_data (
  bill_id int references bills(bill_id),
  product text,
  base_price real,
  discount real,
  qty int
);

insert into inventory values
  ('a', 120.0, 5.0),
  ('b', 180.0, 15),
  ('c', 35.0, 20),
  ('d', 560.0, 4)
;
