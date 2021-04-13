delete from bills_data;
drop table if exists bills;
create table bills (
  bill_id int primary key,
  customer_name text,
  customer_mobile text,
  date text,
  freightcharges real,
  deposited real,
  total real
);

alter table inventory
add column codename text default(null)
;
