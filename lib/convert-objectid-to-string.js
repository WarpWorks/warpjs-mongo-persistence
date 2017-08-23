const _ = require('lodash');

module.exports = (doc) => {
    const converted = _.extend({}, doc);

    if (converted._id) {
        converted.id = converted._id.toString();
        delete converted._id;
    }

    if (converted.parentID) {
        converted.parentID = converted.parentID.toString();
    }

    return converted;
};
