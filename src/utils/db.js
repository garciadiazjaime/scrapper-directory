/* eslint max-len: [2, 500, 4] */
const _ = require('lodash');
const mongo = require('mongodb');
const { MongoClient, ObjectID } = require('mongodb');
const config = require('../config')

let dbClient;

class MongoUtil {

  static generateId() {
    return new ObjectID();
  }

  constructor(connectionString) {
    this.connectionString = connectionString || config.get('db.url');
  }

  openConnection() {
    return new Promise((resolve, reject) => {
      if (!dbClient) {
        MongoClient.connect(this.connectionString,  { useNewUrlParser: true }, (err, db) => {
          if (err) {
            console.log(err)
            reject({ status: false, message: err });
          } else {
            dbClient = db;
            resolve({ status: true });
          }
        });
      } else {
        // reject({ status: false, message: 'DB cant be open' });
        resolve({ status: true });
      }
    });
  }

  insert(collectionName, data) {
    return new Promise((resolve, reject) => {
      if (dbClient) {
        const collection = dbClient.collection(collectionName);
        collection.insert(data, (err, result) => {
          if (err) {
            reject({ status: false, message: err });
          } else {
            resolve({ status: true, data: result });
          }
        });
      } else {
        reject({ status: false, message: 'DB must be open' });
      }
    });
  }

  update(collectionName, data, filter, options) {
    return new Promise((resolve, reject) => {
      if (dbClient) {
        const collection = dbClient.collection(collectionName);
        const newData = _.omit(data, '_id');
        collection.update(filter || {}, { $set: newData }, options || { upsert: true }, (err, result) => {
          if (err) {
            resolve({ status: false, message: err });
          } else {
            resolve({ status: true, data: result });
          }
        });
      } else {
        reject({ status: false, message: 'DB must be open' });
      }
    });
  }

  find(collectionName, filter, options, skip, limit) {
    return new Promise((resolve, reject) => {
      if (dbClient) {
        const collection = dbClient.collection(collectionName);
        collection.find(filter || {}, options || {})
          .skip(skip || 0)
          .limit(limit || 0)
          .toArray((err, documents) => {
            if (err) {
              reject(err);
            } else {
              resolve(documents);
            }
          });
      } else {
        reject({ status: false, message: 'DB must be open' });
      }
    });
  }

  findOne(collectionName, filter) {
    return new Promise((resolve, reject) => {
      if (dbClient) {
        const collection = dbClient.collection(collectionName);
        collection.findOne(filter || {}, (err, item) => {
          if (err) {
            reject(err);
          } else {
            resolve(item);
          }
        });
      } else {
        reject({ status: false, message: 'DB must be open' });
      }
    });
  }

  dropCollection(collectionName) {
    return new Promise((resolve, reject) => {
      if (dbClient) {
        const collection = dbClient.collection(collectionName);
        collection.drop(() => {
          resolve();
        });
      } else {
        reject({ status: false, message: 'DB must be open' });
      }
    });
  }

  getObjectID(id) {
    return new mongo.ObjectID(id);
  }

  closeConnection() {
    dbClient.close();
  }
}


const mongoose = require('mongoose');

function openDB() {
  return mongoose.connect(config.get('db.url'), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  });
}


module.exports = {
  openDB
}
