const elem = document.querySelector.bind(document);

const filters = {
  billno_checkbox: document.querySelector('input[name=billno-checkbox]'),
  billno: elem('input[name=billno]'),

  date_checkbox: elem('input[name=date-checkbox]'),
  date: elem('input[name=date]'),

  datefrom_checkbox: elem('input[name=datefrom-checkbox]'),
  datefrom: elem('input[name=datefrom]'),

  dateto_checkbox: elem('input[name=dateto-checkbox]'),
  dateto: elem('input[name=dateto]'),

  customername_checkbox: elem('input[name=customername-checkbox]'),
  customername: elem('input[name=customername]'),

  customernumber_checkbox: elem('input[name=customernumber-checkbox]'),
  customernumber: elem('input[name=customernumber]'),

  totalgreater_checkbox: elem('input[name=totalgreater-checkbox]'),
  totalgreater: elem('input[name=totalgreater]')
};

const orderby = {
  orderby: elem('select[name=orderby]'),
  orderasc: elem('select[name=orderasc]')
};

const search_button = elem('input[name=search-button]');

const numberbills = elem('#number-bills');
const table = elem('#results-table');
const rowtemplate = elem('#row-template');
const selectall = elem('#table-header').firstElementChild.firstElementChild;
const deleteselected_buttom = elem('input[name=delete-selected]');

const billnos = Array();
const checkboxes = Array();

function search() {
  let queries = [];
  let order = {
	orderby: undefined,
	orderasc: orderby.orderasc.value === 'Ascending' ? 'ASC' : 'DESC'
  };
  switch(orderby.orderby.value) {
	case 'Bill No.':
	  order.orderby = 'bill_id';
	  break;
	case 'Date Time':
	  order.orderby = 'date';
	  break;
	case 'Customer Name':
	  order.orderby = 'customer_name';
	  break;
	case 'Total':
	  order.orderby = 'total';
	  break;
  }

  if (filters.billno_checkbox.checked) {
	queries.push({
	  attribute: 'bill_id',
	  operator: '=',
	  value: filters.billno.value
	});
  } else {
	if (filters.date_checkbox.checked) {
	  queries.push({
		attribute: 'date',
		operator: 'LIKE',
		value: `${filters.date.value}%`
	  });
	}
	if (filters.datefrom_checkbox.checked) {
	  queries.push({
		attribute: 'date',
		operator: '>=',
		value: filters.datefrom.value
	  });
	}
	if (filters.dateto_checkbox.checked) {
	  queries.push({
		attribute: 'date',
		operator: '<=',
		value: filters.dateto.value + 'Z'
	  });
	}
	if (filters.customername_checkbox.checked) {
	  queries.push({
		attribute: 'customer_name',
		operator: '=',
		value: filters.customername.value
	  });
	}
	if (filters.customernumber_checkbox.checked) {
	  queries.push({
		attribute: 'customer_mobile',
		operator: '=',
		value: filters.customernumber.value
	  });
	}
	if (filters.totalgreater_checkbox.checked) {
	  queries.push({
		attribute: 'total',
		operator: '>=',
		value: filters.totalgreater.value
	  });
	}
  }

  fetch('/bills/api/list', {
	method: 'PUT',
	headers: {
	  'Content-Type': 'application/json'
	},
	body: JSON.stringify({
	  queries: queries,
	  orderby: order
	})
  }).then(
	response => response.json()
  ).then(
	data => {
	  if (data.hasOwnProperty('errormsg')) {
		window.alert(data.errormsg);
	  } else {
		displayResults(data);
	  }
  });
}

function toIndianDate(date) {
  return `${date.getDate()} / ${date.getMonth() + 1} / ${date.getFullYear()}`
}

function displayResults(results) {
  while (table.childElementCount > 1)
	table.lastElementChild.remove();
  billnos.length = 0;
  checkboxes.length = 0;
  for (let i=0; i<results.length; i++) {
	let row = rowtemplate.content.firstElementChild.cloneNode(true);

	let a = row.children.item(0).children.item(1);
	let checkbox = row.firstElementChild.firstElementChild;
	a.textContent = results[i].billno;
	a.setAttribute('href', `/billing?billno=${results[i].billno}`);

	row.children.item(1).textContent = toIndianDate(
	  new Date(results[i].date));

	row.children.item(2).textContent = results[i].customername;
	row.children.item(3).textContent = results[i].customermobile;
	row.children.item(4).textContent = results[i].total;

	table.append(row);

	checkboxes.push(checkbox);
	billnos.push(results[i].billno);
  }
  numberbills.textContent = results.length;
}

function selectAllToggle(event) {
  let target = event.target;
  if (target.checked) {
	for (let i=0; i<checkboxes.length; i++) {
	  checkboxes[i].checked = true;
	}
  } else {
	for (let i=0; i<checkboxes.length; i++) {
	  checkboxes[i].checked = false;
	}
  }
}

function deleteSelectedBills() {
  let toDelete = Array();
  for (let i=0; i<checkboxes.length; i++) {
	if (checkboxes[i].checked) {
	  toDelete.push(billnos[i]);
	}
  }
  if (toDelete.length === 0) {
	window.alert('You have not selected any bill(s).');
	return;
  }
  fetch('/bills/api/delete', {
	method: 'POST',
	headers: {
	  'Content-Type': 'application/json'
	},
	body: JSON.stringify({
	  billnos: toDelete
	})
  }).then(
	response => {
	  if (response.ok) {
		window.location.reload();
	  } else {
		return response.json();
	  }
	}
  ).then(
	data => {
	  if (data != undefined) {
		window.alert(data.errormsg);
	  }
	}
  );
}

search_button.addEventListener('click', search);
deleteselected_buttom.addEventListener('click', deleteSelectedBills);
selectall.addEventListener('change', selectAllToggle);
