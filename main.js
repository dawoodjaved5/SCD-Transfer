const readline = require('readline');
const fs = require('fs');
const path = require('path');
const db = require('./db');
require('./events/logger'); // Initialize event logger

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function printMenu() {
  console.log(`
===== NodeVault =====
1. Add Record
2. List Records
3. Update Record
4. Delete Record
5. Search Records
6. Sort Records
7. Export Data
8. View Vault Statistics
9. Exit
=====================
  `);
}

function ask(question) {
  return new Promise(resolve => {
    rl.question(question, answer => resolve(answer));
  });
}

async function handleAddRecord() {
  const name = await ask('Enter name: ');
  const value = await ask('Enter value: ');
  await db.addRecord({ name, value });
  console.log('✅ Record added successfully!');
}

async function handleListRecords() {
  const records = await db.listRecords();
  if (!records || records.length === 0) {
    console.log('No records found.');
    return;
  }

  records.forEach(r => {
    const created = r.createdAt ? new Date(r.createdAt).toISOString() : 'N/A';
    console.log(`ID: ${r.id} | Name: ${r.name} | Value: ${r.value} | Created: ${created}`);
  });
}

async function handleUpdateRecord() {
  const id = await ask('Enter record ID to update: ');
  const name = await ask('New name: ');
  const value = await ask('New value: ');

  const updated = await db.updateRecord(Number(id), name, value);
  console.log(updated ? '✅ Record updated!' : '❌ Record not found.');
}

async function handleDeleteRecord() {
  const id = await ask('Enter record ID to delete: ');
  const deleted = await db.deleteRecord(Number(id));
  console.log(deleted ? '🗑️ Record deleted!' : '❌ Record not found.');
}

async function handleSearchRecords() {
  const keyword = await ask('Enter search keyword: ');
  const term = keyword.trim().toLowerCase();

  const records = await db.listRecords();
  const matches = records.filter(r => {
    const nameMatch = r.name && r.name.toLowerCase().includes(term);
    const idMatch =
      String(r.id).toLowerCase().includes(term) ||
      (!Number.isNaN(Number(term)) && Number(r.id) === Number(term));
    return nameMatch || idMatch;
  });

  if (matches.length === 0) {
    console.log('No records found.');
    return;
  }

  console.log(`Found ${matches.length} matching record(s):`);
  matches.forEach((r, idx) => {
    const created = r.createdAt ? new Date(r.createdAt).toISOString().slice(0, 10) : 'N/A';
    console.log(
      `${idx + 1}. ID: ${r.id} | Name: ${r.name} | Value: ${r.value} | Created: ${created}`
    );
  });
}

async function handleSortRecords() {
  const fieldChoice = await ask('Choose field to sort by (1 = Name, 2 = Creation Date): ');
  const orderChoice = await ask('Choose order (1 = Ascending, 2 = Descending): ');

  const records = await db.listRecords();
  if (!records || records.length === 0) {
    console.log('No records to sort.');
    return;
  }

  const asc = orderChoice.trim() === '1';

  const sorted = [...records].sort((a, b) => {
    if (fieldChoice.trim() === '2') {
      // Creation Date
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return asc ? aDate - bDate : bDate - aDate;
    } else {
      // Name
      const aName = (a.name || '').toLowerCase();
      const bName = (b.name || '').toLowerCase();
      if (aName < bName) return asc ? -1 : 1;
      if (aName > bName) return asc ? 1 : -1;
      return 0;
    }
  });

  console.log('Sorted Records:');
  sorted.forEach((r, idx) => {
    console.log(`${idx + 1}. ID: ${r.id} | Name: ${r.name} | Value: ${r.value}`);
  });
}

async function handleExportData() {
  const records = await db.listRecords();
  const exportFile = path.join(__dirname, 'export.txt');

  const now = new Date();
  const headerLines = [
    'NodeVault Export',
    `Exported At: ${now.toISOString()}`,
    `Total Records: ${records.length}`,
    `File Name: export.txt`,
    '--------------------------'
  ];

  const bodyLines =
    records.length === 0
      ? ['No records available.']
      : records.map((r, idx) => {
          const created = r.createdAt
            ? new Date(r.createdAt).toISOString().slice(0, 10)
            : 'N/A';
          return `${idx + 1}. ID: ${r.id} | Name: ${r.name} | Value: ${r.value} | Created: ${created}`;
        });

  const content = [...headerLines, '', ...bodyLines].join('\n');
  fs.writeFileSync(exportFile, content, 'utf8');

  console.log('✅ Data exported successfully to export.txt.');
}

async function handleVaultStatistics() {
  const records = await db.listRecords();

  if (!records || records.length === 0) {
    console.log('Vault Statistics:');
    console.log('--------------------------');
    console.log('Total Records: 0');
    console.log('No data available for further statistics.');
    return;
  }

  const totalRecords = records.length;

  // Longest name
  let longestNameRecord = records[0];
  for (const r of records) {
    if ((r.name || '').length > (longestNameRecord.name || '').length) {
      longestNameRecord = r;
    }
  }

  // Creation dates
  const dates = records
    .map(r => (r.createdAt ? new Date(r.createdAt) : null))
    .filter(Boolean);

  let earliest = null;
  let latest = null;
  if (dates.length > 0) {
    earliest = new Date(Math.min(...dates.map(d => d.getTime())));
    latest = new Date(Math.max(...dates.map(d => d.getTime())));
  }

  // Last modified: use the latest between createdAt and updatedAt if available
  const modificationDates = records
    .map(r => {
      const created = r.createdAt ? new Date(r.createdAt) : null;
      const updated = r.updatedAt ? new Date(r.updatedAt) : null;
      if (created && updated) return updated > created ? updated : created;
      return updated || created;
    })
    .filter(Boolean);

  let lastModified = null;
  if (modificationDates.length > 0) {
    lastModified = new Date(Math.max(...modificationDates.map(d => d.getTime())));
  }

  console.log('Vault Statistics:');
  console.log('--------------------------');
  console.log(`Total Records: ${totalRecords}`);
  console.log(
    `Last Modified: ${lastModified ? lastModified.toISOString().replace('T', ' ').slice(0, 19) : 'N/A'}`
  );
  console.log(
    `Longest Name: ${longestNameRecord.name} (${(longestNameRecord.name || '').length} characters)`
  );
  console.log(
    `Earliest Record: ${earliest ? earliest.toISOString().slice(0, 10) : 'N/A'}`
  );
  console.log(`Latest Record: ${latest ? latest.toISOString().slice(0, 10) : 'N/A'}`);
}

async function menu() {
  while (true) {
    printMenu();
    const ans = await ask('Choose option: ');

    switch (ans.trim()) {
      case '1':
        await handleAddRecord();
        break;
      case '2':
        await handleListRecords();
        break;
      case '3':
        await handleUpdateRecord();
        break;
      case '4':
        await handleDeleteRecord();
        break;
      case '5':
        await handleSearchRecords();
        break;
      case '6':
        await handleSortRecords();
        break;
      case '7':
        await handleExportData();
        break;
      case '8':
        await handleVaultStatistics();
        break;
      case '9':
        console.log('👋 Exiting NodeVault...');
        rl.close();
        return;
      default:
        console.log('Invalid option.');
    }
  }
}

menu().catch(err => {
  console.error('Unexpected error:', err);
  rl.close();
});

