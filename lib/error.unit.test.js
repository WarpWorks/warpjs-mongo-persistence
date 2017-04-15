const testHelpers = require('@quoin/node-test-helpers');

const PersistenceError = require('./error');

const expect = testHelpers.expect;

describe("lib/error", () => {
    it("should export a class", () => {
        expect(PersistenceError).to.be.a('function')
            .to.have.property('name').to.equal('PersistenceError');
    });

    describe("new PersistenceError()", () => {
        it("should accept 2 params", () => {
            expect(PersistenceError).to.have.lengthOf(2);
        });

        it("should initialize", () => {
            const e = new PersistenceError("a message", {an: 'error'});
            expect(e).to.have.property('name').to.equal('MongoPersistence.PersistenceError');
            expect(e).to.have.property('message').to.equal("a message");
            expect(e).to.have.property('stack');
            expect(e).to.have.property('originalError').to.deep.equal({an: 'error'});
        });
    });

    describe("rethrow()", () => {
        it("should expose 'rethrow()'", () => {
            expect(PersistenceError).to.have.property('rethrow');
        });

        it("should be a function with 3 params", () => {
            expect(PersistenceError.rethrow).to.be.a('function').to.have.lengthOf(3);
        });

        it("should throw new error with params", () => {
            const ErrorClass = testHelpers.stub();
            try {
                PersistenceError.rethrow(ErrorClass, "a message", {an: 'error'});
                expect(null).to.be.undefined();
            } catch (e) {
                expect(ErrorClass).to.have.been.called();
                expect(ErrorClass).to.have.been.calledWith("a message", {an: 'error'});
            }
        });
    });
});
