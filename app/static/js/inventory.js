const inventory_table = document.querySelector('#inventory-table');
const row_template = document.querySelector('#row-template');

const savebutton = document.querySelector('#save-button');
const addnew = document.querySelector('#add-new');
const insertprod = {
  name_field: addnew.children.item(1),
  price_field: addnew.children.item(3),
  discount_field: addnew.children.item(5),
  insert_button: addnew.children.item(6)
};

function Product(name, price, discount) {
  this.name = name;
  this.price = price;
  this.discount = discount;
  this.dirty = false;
  this.inserted = false;
  this.deleted = false;
}

const products = Array();

function checkName(name) {
  if (name === '') {
	window.alert('Name can not be empty');
	return false;
  }
  for (let i=0; i<products.length; i++) {
	if (name == products[i].name) {
	  window.alert('Product of this name already exists in db');
	  return false;
	}
  }
  return true;
}

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

function tableEdited(event) {
  let target = event.target;
  let input_type = target.getAttribute('name');
  let id = event.currentTarget.getAttribute('product_id');
  if (input_type === 'product_price') {
	if (checkPrice(target.value)) {
	  products[id].dirty = true;
	  products[id].price = +target.value;
	  savebutton.disabled = false;
	}
	else
	  target.value = products[id].price;
  } else if (input_type == 'product_discount') {
	if (checkDiscount(target.value)) {
	  products[id].dirty = true;
	  products[id].discount = +target.value;
	  savebutton.disabled = false;
	} else
	  target.value = products[id].discount;
  }
}

function removeRow(event) {
  let target = event.target;
  let input_type = target.getAttribute('name');
  if (input_type === 'product_delete') {
	let id = event.currentTarget.getAttribute('product_id');
	products[id].dirty = true;
	if (!products[id].deleted) {
	  products[id].deleted = true;
	  savebutton.disabled = false;
	  event.currentTarget.style.backgroundColor = 'red';
	  target.value = 'Restore';
	} else {
	  products[id].deleted = false;
	  savebutton.disabled = false;
	  event.currentTarget.style.removeProperty('background-color');
	  target.value = 'Remove';
	}
  }
}

function create_newrow (id, product) {
  let row = row_template.content.firstElementChild.cloneNode(true);
  let name_field = row.children.item(0).firstElementChild;
  let price_field = row.children.item(1).firstElementChild;
  let discount_field = row.children.item(2).firstElementChild;
  let remove_button = row.children.item(3).firstElementChild;

  name_field.value = product.name;
  price_field.value = product.price;
  discount_field.value = product.discount;

  row.setAttribute('product_id', id);
  row.addEventListener('change', tableEdited);
  row.addEventListener('click', removeRow);

  inventory_table.append(row);
}

function insert_newproduct() {
  let name = insertprod.name_field.value;
  if (!checkName(name))
	return;
  let price = insertprod.price_field.value;
  if (!checkPrice(price))
	return;
  price = +price;
  let discount = insertprod.discount_field.value;
  if (!checkDiscount(discount))
	return;
  discount = +discount;

  product = new Product(name, price, discount);
  product.dirty = true;
  product.inserted = true;
  create_newrow(products.length, product);
  products.push(product);
  savebutton.disabled = false;

  insertprod.name_field.value = '';
  insertprod.price_field.value = '';
  insertprod.discount_field.value = '';
}

function save_data() {
  savebutton.disabled = true;
  savebutton.textContent = 'Saving ...';

  let tosave = {
	updated: [],
	inserted: [],
	deleted: []
  };
  for (let i=0; i<products.length; i++) {
	if (products[i].dirty) {
	  if (products[i].inserted || products[i].deleted) {
		if (products[i].inserted)
		  tosave.inserted.push(products[i]);
		if (products[i].deleted)
		  tosave.deleted.push(products[i]);
	  } else {
		tosave.updated.push(products[i]);
	  }
	}
  }

  fetch('/inventory/api/save', {
	method: 'POST',
	headers: {
      'Content-Type': 'application/json'
    },
	body: JSON.stringify(tosave)
  }).then(
	(response) => {
	  if (response.ok) {
		window.location.reload();
	  } else {
		return response.json();
	  }
	}
  ).then(
	(data) => {
	  window.alert(data.errormsg);
	  savebutton.disabled = false;
	  savebutton.textContent = "Save Changes";
	}
  );
}

function setupPage(productlist) {
  for (let i=0; i<productlist.length; i++) {
	let p = productlist[i];
	products.push(
	  new Product(p.name, p.price, p.discount)
	);
	create_newrow(i, p);
  }

  insertprod.insert_button.addEventListener('click',
	insert_newproduct);
  savebutton.addEventListener('click', save_data);
  savebutton.disabled = true;
}

fetch('/inventory/api/list').then(
  response => response.json()
).then(
  data => setupPage(data)
);
