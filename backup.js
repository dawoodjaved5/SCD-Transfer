const fs = require('fs');
const path = require('path');

async function createBackup() {
  try {
    // Lazy load to avoid circular dependency
    const db = require('./db');
    const records = await db.listRecords();

    const backupsDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }

    const now = new Date();
    const pad = n => n.toString().padStart(2, '0');
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
      now.getDate()
    )}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(
      now.getSeconds()
    )}`;

    const filename = `backup_${timestamp}.json`;
    const filePath = path.join(backupsDir, filename);

    fs.writeFileSync(filePath, JSON.stringify(records, null, 2), 'utf8');

    console.log(`📦 Backup created successfully: ${path.join('backups', filename)}`);
  } catch (err) {
    console.error('❌ Failed to create backup:', err.message);
  }
}

module.exports = {
  createBackup
};



