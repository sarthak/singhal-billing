const elem = document.querySelector.bind(document);

const dblocation = elem('input[name=db-location]');
const dbsize = elem('input[name=db-size]');
const dbhealth = elem('input[name=db-health]');
const backuplocation = elem('input[name=db-backuplocation]');
const backupto = elem('input[name=backup-to]');
backupto.value = (new Date()).toISOString().substr(0, 10);
const backupbutton = elem('input[name=backup-button]');

fetch('/manage/api/dbinfo')
.then(response => response.json())
.then(data => {
  if (data.hasOwnProperty('errormsg'))
	window.alert(data.errormsg);
  else {
	dblocation.value = data.location;
	dbsize.value = data.size;
	dbhealth.value = data.health;
	backuplocation.value = data.backuplocation;
  }
});

backupbutton.addEventListener('click',
  () => {
	fetch('/manage/api/backup', {
	  method: 'POST',
	  headers: {
		'Content-Type': 'application/json'
	  },
	  body: JSON.stringify({
		name: backupto.value
	  })
	}).then(
	  response => {
		if (response.ok)
		  return undefined;
		else
		  return response.json();
	  }
	).then(
	  data => {
		if (data === undefined) {
		  window.location.reload();
		} else {
		  window.alert(data.errormsg);
		}
	  }
	);
  }
);
