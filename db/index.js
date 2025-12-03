const recordUtils = require('./record');
const vaultEvents = require('../events');
const { getCollection } = require('./mongo');
const { createBackup } = require('../backup');

async function addRecord({ name, value }) {
  recordUtils.validateRecord({ name, value });

  const collection = await getCollection();
  const newRecord = {
    id: recordUtils.generateId(),
    name,
    value,
    createdAt: new Date()
  };

  await collection.insertOne(newRecord);

  vaultEvents.emit('recordAdded', newRecord);
  await createBackup();
  return newRecord;
}

async function listRecords() {
  const collection = await getCollection();
  const records = await collection.find({}).toArray();
  return records;
}

async function updateRecord(id, newName, newValue) {
  const collection = await getCollection();

  const result = await collection.findOneAndUpdate(
    { id: Number(id) },
    {
      $set: {
        name: newName,
        value: newValue,
        updatedAt: new Date()
      }
    },
    { returnDocument: 'after' }
  );

  const updatedRecord = result.value;
  if (!updatedRecord) return null;

  vaultEvents.emit('recordUpdated', updatedRecord);
  return updatedRecord;
}

async function deleteRecord(id) {
  const collection = await getCollection();
  const result = await collection.findOneAndDelete({ id: Number(id) });
  const deletedRecord = result.value;
  if (!deletedRecord) return null;

  vaultEvents.emit('recordDeleted', deletedRecord);
  await createBackup();
  return deletedRecord;
}

async function clearAllRecords() {
  const collection = await getCollection();
  await collection.deleteMany({});
}

module.exports = {
  addRecord,
  listRecords,
  updateRecord,
  deleteRecord,
  clearAllRecords
};

