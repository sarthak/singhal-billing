const elem = document.querySelector.bind(document);
const row_template = elem('#row-template');

const products_datalist = elem('#products-available');
const products = {}; // Will use this as a hash table

const codenames_datalist = elem('#codenames-available');
const codenames = {}; // Will use this as a hash table

function Row(sno) {
  let row = row_template.content.firstElementChild.cloneNode(true);
  let sel = row.querySelector.bind(row);
  this.html = {
    tr: row,
    sno: sel('span[name=purchase_sno]'),
    codename: sel('input[name=purchase_codename]'),
    name: sel('input[name=purchase_name]'),
    price: sel('input[name=purchase_price]'),
    netrate: sel('input[name=purchase_netrate]'),
    discount: sel('input[name=purchase_discount]'),
    qty: sel('input[name=purchase_qty]'),
    total: sel('span[name=purchase_total]'),
    nettotal: sel('span[name=purchase_nettotal]'),
    remove: sel('input[name=remove-row]')
  };
  this.html.tr.setAttribute('sno', sno);
  this.sno = sno + 1;
  this.price = 0;
  this.discount = 0;
  this.netrate = 0;
  this.qty = 1;
  this.calcRow(true);
}

Row.prototype = newLiveElement({
  nodes: {
    tr: {
      node: undefined
    },
    sno: {
      node: undefined,
      property: 'textContent'
    },
    codename: {
      node: undefined,
      property: 'value'
    },
    name: {
      node: undefined,
      property: 'value'
    },
    price: {
      node: undefined,
      property: 'value',
      get: Number.parseFloat,
      set: normalizedFloat
    },
    netrate: {
      node: undefined,
      property: 'value',
      get: Number.parseFloat,
      set: normalizedFloat
    },
    qty: {
      node: undefined,
      property: 'value',
      get: Number.parseInt,
      set: normalizedInt
    },
    discount: {
      node: undefined,
      property: 'value',
      get: Number.parseFloat,
      set: normalizedFloat
    },
    total: {
      node: undefined,
      property: 'textContent',
      get: Number.parseFloat,
      set: normalizedInt
    },
    nettotal: {
      node: undefined,
      property: 'textContent',
      get: Number.parseFloat,
      set: normalizedInt
    },
    remove: {
      node: undefined
    }
  },
  calcRow: function (withdiscount) {
    if (withdiscount) {
      this.netrate = this.price * (1 - (this.discount / 100));
    } else {
      this.discount = 100 * (this.price - this.netrate) / this.price;
    }
    this.total = this.price * this.qty;
    this.nettotal = this.netrate * this.qty;
  }
});

const bill = newLiveElement({
  nodes: {
    billinfo: {
      id: {
        node: elem('#billno-field'),
        property: 'value'
      },
      date: {
        node: elem('#date-label'),
        property: 'value'
      }
    },
    customer: {
      name: {
        node: elem('#customername-field'),
        property: 'value'
      },
      mobile: {
        node: elem('#customermobile-field'),
        property: 'value'
      }
    },
    ribbon: {
      savebill: {
        node: elem('#savebill-button')
      },
      newbill: {
        node: elem('#newbill-button')
      },
      clearbill: {
        node: elem('#clearbill-button')
      }
    },
    tbody: {
      node: elem('#billing-table').children.item(1)
    },
    bottomrow: {
      node: elem('#bottom-row')
    },
    newrow: {
      node: elem('#addnewrow-button')
    },
    totals: {
      discounttotal: {
        node: elem('#discounttotal'),
        property: 'textContent',
        get: Number.parseFloat,
        set: normalizedInt
      },
      subtotal: {
        node: elem('#subtotal'),
        property: 'textContent',
        get: Number.parseFloat,
        set: normalizedInt
      },
      subnettotal: {
        node: elem('#subnettotal'),
        property: 'textContent',
        get: Number.parseFloat,
        set: normalizedInt
      },
      extradiscount: {
        node: elem('#extradiscount'),
        property: 'value',
        get: Number.parseFloat,
        set: normalizedInt
      },
      subtotallessdiscount: {
        node: elem('#subtotallessdiscount'),
        property: 'textContent',
        get: Number.parseFloat,
        set: normalizedInt
      },
      freightcharges: {
        node: elem('#freightcharges'),
        property: 'value',
        get: Number.parseFloat,
        set: normalizedInt
      },
      total: {
        node: elem('#grandtotal'),
        property: 'textContent',
        get: Number.parseFloat,
        set: normalizedInt
      },
      deposited: {
        node: elem('#alreadydeposited'),
        property: 'value',
        get: Number.parseFloat,
        set: normalizedInt
      },
      payable: {
        node: elem('#balancepayable'),
        property: 'textContent',
        get: Number.parseFloat,
        set: normalizedInt
      }
    }
  },
  rows: Array(),
  will_overwrite: false,
  calcTotals: function () {
    let total = 0.0;
    let nettotal = 0.0;
    this.rows.forEach((row) => {
      total += row.total;
      nettotal += row.nettotal;
    });
    this.totals.subtotal = total;
    this.totals.subnettotal = nettotal;
    this.totals.discounttotal = this.totals.subtotal - this.totals.subnettotal;
    this.totals.subtotallessdiscount = this.totals.subnettotal - this.totals.extradiscount;
    this.totals.total = this.totals.subtotallessdiscount + this.totals.freightcharges;
    this.totals.payable = this.totals.total - this.totals.deposited;
  },
});


function newRow() {
  let row = new Row(bill.rows.length);
  bill.html.bottomrow.before(row.html.tr);
  row.html.tr.addEventListener('change', rowChanged);
  row.html.tr.addEventListener('click', removeRow);
  bill.rows.push(row);
  return row;
}

function rowChanged(event) {
  let row = event.currentTarget;
  let sno = +row.getAttribute('sno');
  row = bill.rows[sno];
  let name = event.target.getAttribute('name');
  if (name === 'purchase_name') {
    let val = event.target.value;
    if (products.hasOwnProperty(val)) {
      let p = products[val];
      row.codename = p.codename;
      row.price = p.price;
      row.discount = p.discount;
      row.qty = 1;
      row.calcRow(true);
    }
  }
  else if (name === 'purchase_codename') {
    let val = event.target.value;
    if (codenames.hasOwnProperty(val)) {
      let p = products[codenames[val]];
      row.name = p.name;
      row.price = p.price;
      row.discount = p.discount;
      row.qty = 1;
      row.calcRow(true);
    }
  }
  else if (name === 'purchase_price') {
    let val = event.target.value;
    row.price = val;
    row.calcRow(true);
  }
  else if (name === 'purchase_discount') {
    let val = event.target.value;
    row.discount = val;
    row.calcRow(true);
  }
  else if (name === 'purchase_qty') {
    let val = event.target.value;
    row.qty = val;
    row.calcRow(true);
  }
  else if (name === 'purchase_netrate') {
    row.netrate = event.target.value;
    row.calcRow(false);
  }
  bill.calcTotals();
}

function removeRow(event) {
  let target = event.target;
  if (target.getAttribute('name') === 'remove-row') {
    let sno = +event.currentTarget.getAttribute('sno');
    let row = bill.rows[sno];
    row.html.tr.remove();
    bill.rows.splice(sno, 1);
    for (let i = sno; i < bill.rows.length; i++) {
      bill.rows[i].sno = i+1;
      bill.rows[i].html.tr.setAttribute('sno', i);
    }
    bill.calcTotals();
  }
}

function clearBill(force) {
  if (force || window.confirm('Are you sure you want to clear the bill?')) {
    bill.rows.forEach((row) => {
      row.html.tr.remove();
    });
    bill.rows.length = 0;
    bill.customer.name = '';
    bill.customer.mobile = '';
    bill.totals.extradiscount = 0;
    bill.totals.freightcharges = 0;
    bill.totals.deposited = 0;
    newRow();
    bill.calcTotals();
  }
}

function newBill(force) {
  if (force || window.confirm('Are you sure you want to create a new bill?')) {
    clearBill(true);
    bill.billinfo.date = toIndianDate(new Date());

    fetch('/billing/api/billno').then(
      response => response.json()
    ).then(
      data => bill.billinfo.id = data.billno
    );
    bill.will_overwrite = false;
  }
}

function carryoutSave() {
  let request = {
    overwrite: bill.will_overwrite,
    billno: bill.billinfo.id,
    customer_name: bill.customer.name,
    customer_mobile: bill.customer.mobile,
    date: (new Date()).toISOString(),
    freightcharges: bill.totals.freightcharges,
    deposited: bill.totals.deposited,
    total: bill.totals.total,
    purchases: []
  };
  for (let i = 0; i < bill.rows.length; i++) {
    let row = bill.rows[i];
    request.purchases.push({
      name: row.name,
      price: row.price,
      discount: row.discount,
      qty: row.qty,
    });
  }

  fetch('/billing/api/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(request)
  }).then(
    response => {
      if (!response.ok) {
        return response.json();
      }
    }).then(
      data => {
        if (data === undefined) {
          // save complete
          bill.will_overwrite = true;
        } else {
          window.alert(data.errormsg);
        }
        bill.ribbon.html.savebill.disabled = false;
      });
}


function saveBill() {
  bill.ribbon.html.savebill.disabled = true;
  if (bill.will_overwrite) {
    if (window.confirm('You are about to overwrite an already saved bill with this bill no, overwrite?')) {
      carryoutSave();
    } else {
      bill.ribbon.html.savebill.disabled = false;
    }
  }
  else {
    carryoutSave();
  }
}

function loadBill(data) {
  bill.customer.name = '';
  bill.customer.mobile = '';
  bill.totals.extradiscount = 0;
  bill.totals.freightcharges = 0;
  bill.totals.deposited = 0;
  for (let i = 0; i < data.purchases.length; i++) {
    let p = data.purchases[i];
    let row = newRow();
    row.name = p.name;
    row.price = p.price;
    row.discount = p.discount;
    row.qty = p.qty;
    row.calcRow(true);
  }

  bill.totals.freightcharges = data.freightcharges;
  bill.totals.deposited = data.deposited;
  bill.calcTotals();
  bill.totals.extradiscount = bill.totals.total - data.total;
  bill.calcTotals();

  bill.billinfo.id = data.billno;
  bill.billinfo.date = toIndianDate(new Date(data.date));
  bill.customer.name = data.customername;
  bill.customer.mobile = data.customermobile;

  bill.will_overwrite = true;
}

function setupPage(productList) {
  for (let i = 0; i < productList.length; i++) {
    let p = productList[i];
    products[p.name] = p;
    let opt = document.createElement('option');
    opt.setAttribute('value', p.name);
    products_datalist.append(opt);

    if (p.codename != null) {
      codenames[p.codename] = p.name;
      let opt = document.createElement('option');
      opt.setAttribute('value', p.codename);
      codenames_datalist.append(opt);
    }
  }

  bill.html.newrow.addEventListener('click', newRow);
  bill.totals.html.extradiscount.addEventListener(
    'change', () => bill.calcTotals());
  bill.totals.html.freightcharges.addEventListener(
    'change', () => bill.calcTotals());
  bill.totals.html.deposited.addEventListener(
    'change', () => bill.calcTotals());

  bill.ribbon.html.newbill.addEventListener('click', () => newBill(false));
  bill.ribbon.html.clearbill.addEventListener('click', () => clearBill(false));
  bill.ribbon.html.savebill.addEventListener('click', saveBill);
}

fetch('/inventory/api/list').then(
  response => response.json()
).then(
  data => setupPage(data)
);

const url = new URL(window.location.href);
if (url.searchParams.has('billno')) {
  // Load an already existing bill
  let billno = url.searchParams.get('billno');
  fetch(`/bills/api/bill/${encodeURIComponent(billno)}`)
    .then(
      response => response.json()
    ).then(
      data => loadBill(data)
    );
}
else {
  newBill(true);
}
