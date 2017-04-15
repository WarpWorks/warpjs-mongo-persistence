function rethrow(ErrorClass, message, originalError) {
    throw new ErrorClass(message, originalError);
}

class PersistenceError extends Error {
    constructor(message, originalError) {
        super(message);
        this.name = `MongoPersistence.${this.constructor.name}`;
        this.originalError = originalError;
    }
}

PersistenceError.rethrow = rethrow;

module.exports = PersistenceError;
