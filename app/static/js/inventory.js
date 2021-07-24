const elem = document.querySelector.bind(document);

function Product(id, name, codename, price, discount) {
  this.id = id;
  this.name = name;
  this.codename = codename;
  if (!this.codename)
    this.codename = null;
  this.price = normalizedFloat(price);
  this.discount = normalizedFloat(discount);
  this.netrate = normalizedFloat(this.price * (100 - this.discount) / 100);
  this.dirty = false;
  this.inserted = false;
  this.deleted = false;
}

Product.prototype = {
  update: function (with_discount) {
    if (!this.codename)
      this.codename = null;
    this.price = normalizedFloat(this.price);
    if (with_discount) {
      this.discount = normalizedFloat(this.discount);
      this.netrate = normalizedFloat(this.price * (100 - this.discount) / 100);
    } else {
      this.netrate = normalizedFloat(this.netrate);
      this.discount = normalizedFloat(100 * (this.price - this.netrate) / this.price);
    }
  }
}

const row_template = elem('#row-template');
const addnew = elem('#add-new');
const insertprod = newLiveElement({
  nodes: {
    button: {
      node: addnew.querySelector('button')
    },
    name: {
      node: addnew.querySelector('input[name=name]'),
      property: 'value'
    },
    codename: {
      node: addnew.querySelector('input[name=codename]'),
      property: 'value'
    },
    price: {
      node: addnew.querySelector('input[name=price]'),
      property: 'value'
    },
    discount: {
      node: addnew.querySelector('input[name=discount]'),
      property: 'value'
    },
    netrate: {
      node: addnew.querySelector('input[name=netrate]'),
      property: 'value'
    }
  }
});

const table = newLiveElement({
  nodes: {
    save: {
      node: elem('#save-button')
    },
    tbody: {
      node: elem('#inventory-table').querySelector('tbody')
    }
  },
  products: Array()
});

const paginator = new Paginator({
  body: table.html.tbody,
  navs: [
    elem('#top-page-navigator'),
    elem('#bottom-page-navigator')
  ],
  items: table.products,
  maxitems: 20,
  renderer: productRenderer
});

const row_helpers = {
  name: (row) => {
    return row.children.item(0).firstElementChild;
  },
  codename: (row) => {
    return row.children.item(1).firstElementChild;
  },
  price: (row) => {
    return row.children.item(2).firstElementChild;
  },
  discount: (row) => {
    return row.children.item(3).firstElementChild;
  },
  netrate: (row) => {
    return row.children.item(4).firstElementChild;
  },
  remove: (row) => {
    return row.children.item(5).firstElementChild;
  },
  copyFromProduct(row, product) {
    this.name(row).value = product.name;
    this.codename(row).value = product.codename;
    this.price(row).value = product.price;
    this.discount(row).value = product.discount;
    this.netrate(row).value = product.netrate;
    if (product.deleted) {
      row.style.backgroundColor = 'red';
      this.remove(row).value = 'Restore';
    } else {
      row.style.removeProperty('background-color');
      this.remove(row).value = 'Remove';
    }
  }
};

function productRenderer(product) {
  let row = row_template.content.firstElementChild.cloneNode(true);
  row.setAttribute('product_id', product.id);
  row.addEventListener('change', tableEdited);
  row.addEventListener('click', removeRow);
  row_helpers.copyFromProduct(row, product);
  return row;
}

function checkName(name) {
  if (name === '') {
    window.alert('Name can not be empty');
    return false;
  }
  for (let i = 0; i < table.products.length; i++) {
    if (name == table.products[i].name) {
      window.alert('Product of this name already exists in db');
      return false;
    }
  }
  return true;
}

function checkCodename(codename) {
  // for (let i=0; i<table.products.length; i++) {
  // if (codename == table.products[i].codename) {
  // window.alert('Product of this code name already exists in db');
  // return false;
  // }
  // }
  return true;
}

function tableEdited(event) {
  let products = table.products;
  let target = event.target;
  let input_type = target.getAttribute('name');
  let id = event.currentTarget.getAttribute('product_id');
  if (input_type === 'product_price') {
    if (checkPrice(target.value)) {
      products[id].dirty = true;
      products[id].price = target.value;
      table.html.save.disabled = false;
      products[id].update(true);
    }
  } else if (input_type === 'product_codename') {
    if (checkCodename(target.value)) {
      products[id].dirty = true;
      products[id].codename = target.value;
      table.html.save.disabled = false;
      products[id].update(true);
    }
  } else if (input_type == 'product_discount') {
    if (checkDiscount(target.value)) {
      products[id].dirty = true;
      products[id].discount = +target.value;
      table.html.save.disabled = false;
      products[id].update(true);
    }
  } else if (input_type == 'product_netrate') {
    if (checkPrice(target.value)) {
      products[id].dirty = true;
      products[id].netrate = +target.value;
      products[id].update(false);
    }
  }
  row_helpers.copyFromProduct(event.currentTarget, products[id]);
}

function removeRow(event) {
  let target = event.target;
  let input_type = target.getAttribute('name');
  if (input_type === 'product_delete') {
    let id = event.currentTarget.getAttribute('product_id');
    table.products[id].dirty = true;
    if (!table.products[id].deleted) {
      table.products[id].deleted = true;
      table.html.save.disabled = false;
    } else {
      table.products[id].deleted = false;
      table.html.save.disabled = false;
    }
    row_helpers.copyFromProduct(event.currentTarget, table.products[id]);
  }
}

function insert_newproduct() {
  let name = insertprod.name;
  if (!checkName(name))
    return;
  let codename = insertprod.codename;
  if (!checkCodename(codename))
    return;
  let price = insertprod.price;
  if (!checkPrice(price))
    return;
  let discount = insertprod.discount;
  if (!checkDiscount(discount))
    return;
  let netrate = insertprod.netrate;
  if (netrate !== '') {
    if (!checkPrice(netrate))
      return;
    netrate = +netrate;
    discount = 100 * (price - netrate) / price;
  }

  product = new Product(table.products.length, name, codename, price, discount);
  product.dirty = true;
  product.inserted = true;
  table.products.push(product);
  paginator.refresh();
  table.html.save.disabled = false;

  insertprod.name = '';
  insertprod.codename = '';
  insertprod.price = '';
  insertprod.discount = '';
  insertprod.netrate = '';
}

function save_data() {
  table.html.save.disabled = true;
  table.html.save.textContent = 'Saving ...';
  let products = table.products;

  let tosave = {
    updated: [],
    inserted: [],
    deleted: []
  };
  for (let i = 0; i < products.length; i++) {
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
      table.html.save.disabled = false;
      table.html.save.textContent = "Save Changes";
    }
  );
}

function setupPage(productlist) {
  for (let i = 0; i < productlist.length; i++) {
    let p = productlist[i];
    table.products.push(
      new Product(i, p.name, p.codename, p.price, p.discount)
    );
  }

  insertprod.html.button.addEventListener('click',
    insert_newproduct);
  table.html.save.addEventListener('click', save_data);
  table.html.save.disabled = true;
  paginator.refresh();
}

fetch('/inventory/api/list').then(
  response => response.json()
).then(
  data => setupPage(data)
);
