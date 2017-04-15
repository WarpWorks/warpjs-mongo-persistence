const _ = require('lodash');
const Promise = require('bluebird');
const mongodb = require('mongodb');
const urlTemplate = require('url-template');

const PersistenceError = require('./error');

const connectionTemplate = urlTemplate.parse('mongodb://{host}/{dbName}');

function convertIdFromNative(doc) {
    const converted = _.extend({}, _.omit(doc, '_id'), {
        id: doc._id.toString()
    });

    if (converted.parentID) {
        converted.parentID = converted.parentID.toString();
    }

    return converted;
}

const rethrow = PersistenceError.rethrow.bind(null, PersistenceError);

class Persistence {
    constructor(host, dbName) {
        this._host = host;
        this._dbName = dbName;

        // TODO: Instead of fake private, look at WeakMap().
        this._db = null;
    }

    get _connection() {
        if (!this._db) {
            const url = connectionTemplate.expand({
                host: this._host,
                dbName: this._dbName
            });
            return Promise.resolve()
                .then(() => mongodb.MongoClient.connect(url))
                .then((db) => {
                    this._db = db;
                    return this._db;
                })
                .catch(rethrow.bind(null, "Connection error."));
        }
        return Promise.resolve(this._db);
    }

    close(forceClose) {
        if (this._db) {
            return this._connection
                .then((db) => db.close(forceClose))
                .catch(rethrow.bind(null, "Cannot close connection."));
        }
        return Promise.resolve();
    }

    get databases() {
        return this._connection
            .then((db) => db.admin().listDatabases())
            .then((results) => {
                if (results.ok) {
                    return results.databases.map((db) => db.name);
                }
                // TODO: Check what error we can rethrow?
                throw new PersistenceError("Cannot listDatabases()");
            })
            .catch(rethrow.bind(null, "Cannot listDatabases()."));
    }

    get collections() {
        return this._connection
            .then((db) => db.listCollections().toArray())
            .catch(rethrow.bind(null, "Cannot get collections."));
    }

    documents(collectionName, query, convertId) {
        if (convertId && query && query._id) {
            query._id = mongodb.ObjectID(query._id);
        }

        if (convertId && query && query.parentID) {
            query.parentID = mongodb.ObjectID(query.parentID);
        }

        return this._connection
            .then((db) => db.collection(collectionName))
            .then((collection) => collection.find(query).toArray())
            .then((documents) => documents.map(convertIdFromNative))
            .catch(rethrow.bind(null, "Cannot get documents."));
    }

    findOne(collectionName, query, convertId) {
        if (convertId && query && query._id) {
            query._id = mongodb.ObjectID(query._id);
        }
        return this._connection
            .then((db) => db.collection(collectionName))
            .then((collection) => collection.findOne(query))
            .then((doc) => convertIdFromNative(doc))
            .catch(rethrow.bind(null, `Cannot find '${collectionName}'='${query._id}'.`));
    }

    save(collectionName, doc) {
        return this._connection
            .then((db) => db.collection(collectionName))
            .then((collection) => collection.insertOne(doc))
            .catch(rethrow.bind(null, "Failed to save document."));
    }

    aggregate(collectionName, collectionJoinKey, foreignCollection, foreignKey, aggregateOutputName, matchQuery) {
        const lookup = {
            from: foreignCollection,
            foreignField: foreignKey,
            localField: collectionJoinKey,
            as: aggregateOutputName
        };
        const aggrObj = [{ $lookup: lookup }, { $match: matchQuery }];

        return this._connection
            .then((db) => db.collection(collectionName))
            .then((collection) => collection.aggregate(aggrObj).toArray())
            .catch(rethrow.bind(null, "Cannot find user."));
    }
}

Persistence.PersistenceError = PersistenceError;

module.exports = Persistence;
