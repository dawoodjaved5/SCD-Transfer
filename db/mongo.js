const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nodevault';
const dbName = process.env.MONGO_DB_NAME || 'nodevault';

let client;
let db;

async function getDb() {
  if (db) return db;

  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }

  db = client.db(dbName);
  return db;
}

async function getCollection() {
  const database = await getDb();
  return database.collection('records');
}

module.exports = {
  getCollection
};



