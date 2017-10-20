const debug = require('debug')('W2:persistence:mongo');
const Promise = require('bluebird');
const mongodb = require('mongodb');
const path = require('path');
const shelljs = require('shelljs');
const urlTemplate = require('url-template');
const WarpJSPersistence = require('@warp-works/warpjs-persistence');

const convertObjectIdToString = require('./convert-objectid-to-string');
const convertStringToObjectId = require('./convert-string-to-objectid');
const WarpJSMongoPersistenceError = require('./error');

const connectionTemplate = urlTemplate.parse('mongodb://{host}/{dbName}');

const rethrow = WarpJSMongoPersistenceError.rethrow.bind(null, WarpJSMongoPersistenceError);

class WarpJSMongoPersistence extends WarpJSPersistence {
    constructor(host, dbName) {
        super(host, dbName);

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
                throw new WarpJSMongoPersistenceError("Cannot listDatabases()");
            })
            .catch(rethrow.bind(null, "Cannot listDatabases()."));
    }

    get collections() {
        return this._connection
            .then((db) => db.listCollections().toArray())
            .catch(rethrow.bind(null, "Cannot get collections."));
    }

    collection(collectionName) {
        return this._connection
            .then((db) => db.collection(collectionName));
    }

    documents(collectionName, query, convertId) {
        if (convertId && query && query._id) {
            query._id = mongodb.ObjectID(query._id);
        }

        if (convertId && query && query.parentID) {
            query.parentID = mongodb.ObjectID(query.parentID);
        }

        return this.collection(collectionName)
            .then((collection) => collection.find(query).toArray())
            .then((documents) => documents.map(convertObjectIdToString))
            .catch(rethrow.bind(null, "Cannot get documents."));
    }

    findOne(collectionName, query) {
        const converted = convertStringToObjectId(query);

        return this.collection(collectionName)
            .then((collection) => collection.findOne(converted))
            .then((doc) => convertObjectIdToString(doc))
            .catch(rethrow.bind(null, `Cannot find '${collectionName}'='${converted.id}'.`));
    }

    save(collectionName, doc) {
        const converted = convertStringToObjectId(doc);

        return this.collection(collectionName)
            .then((collection) => collection.insertOne(converted))
            .then((res) => res.ops[0])
            .then((instance) => convertObjectIdToString(instance))
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

        return this.collection(collectionName)
            .then((collection) => collection.aggregate(aggrObj).toArray())
            .catch(rethrow.bind(null, "Cannot find user."));
    }

    remove(collectionName, id) {
        const converted = convertStringToObjectId(id);

        return this.collection(collectionName)
            .then((collection) => collection.deleteOne(converted))
            .catch(rethrow.bind(null, "Failed to delete document."));
    }

    update(collectionName, doc) {
        const converted = convertStringToObjectId(doc);

        return this.collection(collectionName)
            .then((collection) => collection.update({_id: converted._id}, converted))
            .catch(rethrow.bind(null, "Failed to update document."));
    }

    makeBackup(outputFolder, config) {
        const dbFolder = path.join(outputFolder, 'dbdump');
        const options = {
            silent: true
        };
        const command = `mongodump --host "${config.host}" -d "${this._dbName}" -o "${dbFolder}"`;

        return new Promise((resolve, reject) => {
            if (!shelljs.which('mongodump')) {
                reject(new WarpJSPersistence(`Cannot find 'mongodump' required to backup mongo data.`));
            } else {
                debug(`makeBackup(): exec: ${command}`);
                shelljs.exec(command, options, (code, stdout, stderr) => {
                    if (code !== 0) {
                        reject(new WarpJSMongoPersistenceError(`Error executing mongodump: ${stderr}`));
                    } else {
                        resolve(stdout);
                    }
                });
            }
        });
    }
}

WarpJSMongoPersistence.Error = WarpJSMongoPersistenceError;

module.exports = WarpJSMongoPersistence;
