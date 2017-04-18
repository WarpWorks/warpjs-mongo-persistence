const WarpJSPersistenceError = require('@warp-works/warpjs-persistence').Error;

class WarpJSMongoPersistenceError extends WarpJSPersistenceError {
    constructor(message, originalError) {
        super(message, originalError);
        this.name = `WarpJSMongoPersistence.${this.constructor.name}`;
    }
}

WarpJSMongoPersistenceError.rethrow = WarpJSPersistenceError.rethrow;

module.exports = WarpJSMongoPersistenceError;
