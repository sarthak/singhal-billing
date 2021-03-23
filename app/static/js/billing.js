const billing_table = document.querySelector('#billing-table');
const row_template = document.querySelector('#row-template');
const total_row = document.querySelector('#total-row');
const addnew_button = total_row.children.item(1).firstElementChild;
const total_td = total_row.children.item(6);
const products_datalist = document.querySelector('#products-available');
const newbill_button = document.querySelector('#newbill-button');
const clearbill_button = document.querySelector('#clearbill-button');

function Purchase() {
  this.name = '';
  this.price = 0.0;
  this.discount = 0.0;
  this.netrate = 0.0;
  this.qty = 1;
  this.total = 0.0;
}

const purchases = Array();
const products = {}; // Will use this as a hash table

function checkPrice(price) {
  let p = +price;
  if (isNaN(p)) {
	window.alert('Price is not a valid number');
	return false;
  } else if (p < 0) {
	window.alert('Price should be positive');
  }
  return true;
}

function checkDiscount(discount) {
  let d = +discount;
  if (isNaN(d)) {
	window.alert('Discount is not a valid number');
	return false;
  } else if (d < 0 || d > 100) {
	window.alert('Discount should be a percentage between 0 and 100');
	return false;
  }
  return true;
}

function checkQty(qty) {
  let q = +qty;
  if (isNaN(q)) {
	window.alert('Quantity is not a valid number');
	return false;
  } else if (q < 1) {
	window.alert('Quantity should be greater than 1');
	return false;
  }
  return true;
}

function updateTotal () {
  let total = 0.0;
  for (let i=0; i<purchases.length; i++) {
	total += purchases[i].total;
  }
  total_td.textContent = total;
}

function clearBill() {
  for (let i=0; i<purchases.length; i++) {
	total_row.previousSibling.remove();
  }
  purchases.length = 0;
  updateTotal();
}

function updateRow(row, purchase) {
  purchase.netrate = purchase.price * (100 - purchase.discount)/100;
  purchase.total = purchase.netrate * purchase.qty;

  let name = row.children.item(1).firstElementChild;
  let price = row.children.item(2).firstElementChild;
  let discount = row.children.item(3).firstElementChild;
  let netrate = row.children.item(4).firstElementChild;
  let qty = row.children.item(5).firstElementChild;
  let total = row.children.item(6).firstElementChild;

  name.value = purchase.name;
  price.value = purchase.price;
  discount.value = purchase.discount;
  netrate.textContent = purchase.netrate;
  qty.value = purchase.qty;
  total.textContent = purchase.total;
  updateTotal();
}

function rowChanged(event) {
  let row = event.currentTarget;
  let sno = +row.getAttribute('sno');
  let target = event.target;
  let name = target.getAttribute('name');
  if (name === 'purchase_name') {
	let val = target.value;
	if (products.hasOwnProperty(val)) {
	  let p = products[val];
	  purchases[sno].name = val;
	  purchases[sno].price = p.price;
	  purchases[sno].discount = p.discount;
	  purchases[sno].qty = 1;
	} else {
	  purchases[sno].name = val;
	}
	updateRow(row, purchases[sno]);
  }
  else if (name === 'purchase_price') {
	let val = target.value;
	if (checkPrice(val)) {
	  purchases[sno].price = +val;
	  updateRow(row, purchases[sno]);
	} else {
	  target.value = purchases[sno].price;
	}
  }
  else if (name === 'purchase_discount') {
	let val = target.value;
	if (checkDiscount(val)) {
	  purchases[sno].discount = +val;
	  updateRow(row, purchases[sno]);
	} else {
	  target.value = purchases[sno].discount;
	}
  }
  else if (name === 'purchase_qty') {
	let val = target.value;
	if (checkQty(val)) {
	  purchases[sno].qty = +val;
	  updateRow(row, purchases[sno]);
	} else {
	  target.value = purchases[sno].qty;
	}
  }
}

function removeRow(event) {
  let target = event.target;
  if (target.getAttribute('name') === 'remove-row') {
	let sno = +event.currentTarget.getAttribute('sno');
	purchases.splice(sno, 1);
	event.currentTarget.remove();
	let rows = billing_table.firstElementChild.children;
	for (let i=sno; i<purchases.length; i++) {
	  rows.item(i+1).children.item(0).
		firstElementChild.textContent = i+1;
	  rows.item(i+1).setAttribute('sno', i);
	}
  }
  updateTotal();
}

function addNewPurchaseRow(sn, purchase) {
  let row = row_template.content.firstElementChild.cloneNode(true);
  let sno = row.children.item(0).firstElementChild;
  sno.textContent = sn + 1;
  updateRow(row, purchase);

  row.setAttribute('sno', sn);
  row.addEventListener('click', removeRow);
  row.addEventListener('change', rowChanged);
  total_row.before(row);
}

function newPurchase() {
  let sno = purchases.length;
  let purchase = new Purchase();
  addNewPurchaseRow(sno, purchase);
  purchases.push(purchase);
}

function setupPage(productList) {
  for (let i=0; i<productList.length; i++) {
	let p = productList[i];
	products[p.name] = p;
	let opt = document.createElement('option');
	opt.setAttribute('value', p.name);
	products_datalist.append(opt);
  }

  addnew_button.addEventListener('click', newPurchase);
  newPurchase();

  newbill_button.addEventListener('click', clearBill);
  clearbill_button.addEventListener('click', clearBill);

  document.querySelector('#date-label').textContent = 
	(new Date()).toISOString().substring(0, 10);
}

fetch('/inventory/api/list').then(
  response => response.json()
).then(
  data => setupPage(data)
);
