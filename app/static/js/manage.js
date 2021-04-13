const elem = document.querySelector.bind(document);

const dblocation = elem('input[name=db-location]');
const dbsize = elem('input[name=db-size]');
const dbhealth = elem('input[name=db-health]');
const backuplocation = elem('input[name=db-backuplocation]');
const backupto = elem('input[name=backup-to]');
backupto.value = (new Date()).toISOString().substr(0, 10);
const backupbutton = elem('input[name=backup-button]');

const backuprow_template = elem('#row-template');
const backup_table = elem('#backup-table').tBodies[0];

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

fetch('/manage/api/list')
.then(response => response.json())
.then(data => {
  data.forEach((backup) => {
    addBackupRow(backup);
  });
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

function addBackupRow(backup) {
  let row = backuprow_template.content.firstElementChild.cloneNode(true);
  row.children.item(0).textContent = backup.name;
  row.children.item(1).textContent = backup.size;
  row.setAttribute('data-backup-name', backup.name);
  row.addEventListener('click', rowClicked);
  backup_table.append(row);
}

function rowClicked(event) {
  let row = event.currentTarget;
  let button = event.target;
  if (button.name === 'restore-backup') {
    restoreBackup(row.getAttribute('data-backup-name'));
  } else if (button.name === 'delete-backup') {
    deleteBackup(row, row.getAttribute('data-backup-name'));
  }
}

function restoreBackup(backup) {
  if (window.confirm('Are you sure you want to restore this backup?')) {
    fetch('/manage/api/restore', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: backup
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
        if (data == undefined) {
          window.alert('Backup restored successfully!');
          window.location.reload();
        }
        else {
          window.alert(data['errormsg']);
        }
      }
    );
  }
}

function deleteBackup(row, backup) {
  if (window.confirm('Are you sure you want to delete this backup?')) {
    fetch('/manage/api/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: backup
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
        if (data == undefined) {
          window.alert('Backup deleted successfully!');
          row.remove();
        }
        else {
          window.alert(data['errormsg']);
        }
      }
    );
  }
}
