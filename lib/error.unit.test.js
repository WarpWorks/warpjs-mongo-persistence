const testHelpers = require('@quoin/node-test-helpers');

const WarpJSMongoPersistenceError = require('./error');

const expect = testHelpers.expect;

describe("lib/error", () => {
    it("should export a class", () => {
        expect(WarpJSMongoPersistenceError).to.be.a('function').to.have.property('name');
        expect(WarpJSMongoPersistenceError.name).to.equal('WarpJSMongoPersistenceError');
    });

    describe("new WarpJSMongoPersistenceError()", () => {
        it("should accept 2 params", () => {
            expect(WarpJSMongoPersistenceError).to.have.lengthOf(2);
        });

        it("should initialize", () => {
            const e = new WarpJSMongoPersistenceError("a message", {an: 'error'});
            expect(e).to.have.property('name');
            expect(e.name).to.equal('WarpJSMongoPersistence.WarpJSMongoPersistenceError');
            expect(e).to.have.property('message');
            expect(e.message).to.equal("a message");
            expect(e).to.have.property('stack');
            expect(e).to.have.property('originalError');
            expect(e.originalError).to.deep.equal({an: 'error'});
        });
    });

    describe("rethrow()", () => {
        it("should expose 'rethrow()'", () => {
            expect(WarpJSMongoPersistenceError).to.have.property('rethrow');
        });

        it("should be a function with 3 params", () => {
            expect(WarpJSMongoPersistenceError.rethrow).to.be.a('function').to.have.lengthOf(3);
        });

        it("should throw new error with params", () => {
            const ErrorClass = testHelpers.stub();
            try {
                WarpJSMongoPersistenceError.rethrow(ErrorClass, "a message", {an: 'error'});
                expect(null).to.be.undefined();
            } catch (e) {
                expect(ErrorClass).to.have.been.called();
                expect(ErrorClass).to.have.been.calledWith("a message", {an: 'error'});
            }
        });
    });
});
