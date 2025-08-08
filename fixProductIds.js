// fixProductIds.js
const { MongoClient } = require('mongodb');

async function run() {
  const uri = 'mongodb://localhost:27017'; // apne MongoDB ka URI yahan dalen
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('BRMS');
    const stores = db.collection('stores');

    const allStores = await stores.find({}).toArray();

    for (const store of allStores) {
      let updated = false;
      if (Array.isArray(store.products)) {
        for (const prod of store.products) {
          if (typeof prod._id !== 'string') {
            prod._id = prod._id.toString();
            updated = true;
          }
        }
      }
      if (updated) {
        await stores.updateOne(
          { _id: store._id },
          { $set: { products: store.products } }
        );
      }
    }

    console.log('All product _id fields converted to string!');
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();

