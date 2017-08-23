const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;

module.exports = (doc) => {
    if (_.isString(doc)) {
        doc = {
            id: doc
        };
    }

    const converted = _.omit(doc, 'id');

    if (doc.id) {
        converted._id = ObjectID(doc.id);
    }

    if (doc.parentID) {
        converted.parentID = ObjectID(doc.parentID);
    }

    return converted;
};
