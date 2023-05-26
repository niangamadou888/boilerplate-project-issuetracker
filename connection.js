const { MongoClient } = require('mongodb');
const client = new MongoClient(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
let collection;

async function connect() {

  try {
    await client.connect();
    collection = await client.db('test').collection('issues');
  } catch (err) {
    console.error('Database connection error');
    throw err;
  }
}

function getColl() {
  return collection;
}

module.exports = { connect, getColl };