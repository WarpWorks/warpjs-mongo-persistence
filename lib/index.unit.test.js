const testHelpers = require('@quoin/node-test-helpers');
const mongoMock = require('mongo-mock');

const expect = testHelpers.expect;

mongoMock.max_delay = 10; // reduce delay for speed up tests.

describe("lib/index", () => {
    let WarpJSMongoPersistence;

    beforeEach(() => {
        WarpJSMongoPersistence = testHelpers.proxyquire(require.resolve('./index'), {
            mongodb: mongoMock
        });
    });

    it("should export a class", () => {
        expect(WarpJSMongoPersistence).to.be.a('function')
            .to.have.property('name').to.equal('WarpJSMongoPersistence');
    });

    it("should accept 2 params", () => {
        expect(WarpJSMongoPersistence).to.have.lengthOf(2);
    });

    describe("WarpJSMongoPersistence()", () => {
        let instance;

        beforeEach(() => {
            instance = new WarpJSMongoPersistence('dummy-host', 'dbName');
        });

        it("should reuse cached connection", () => {
            return instance._connection.then(() => instance._connection);
        });

        describe(".close()", () => {
            it("should expose 'close()' method", () => {
                expect(instance).to.have.property('close')
                    .to.be.a('function')
                    .to.have.lengthOf(1);
            });

            it("should be able to call without param", () => {
                return instance.close()
                    .catch((err) => {
                        expect(err).to.be.undefined();
                    });
            });

            it("should be able to call with param", () => {
                return instance.close(true)
                    .catch((err) => {
                        expect(err).to.be.undefined();
                    });
            });

            it("should close because connection is open", () => {
                return instance.collections
                    .then(() => instance.close())
                    .catch((err) => {
                        expect(err).to.be.undefined();
                    });
            });
        });

        // NOTE: mongo-mock doesn't implement db.admin()
        it.skip("should expose 'databases' getter", () => {
            expect(instance).to.have.property('databases');
        });

        describe(".collections", () => {
            it("should expose 'collections' getter", () => {
                expect(instance).to.have.property('collections');
            });

            it("should be an array", () => {
                return instance.collections
                    .then((collections) => {
                        expect(collections).to.be.an('array');
                    });
            });
        });

        describe(".documents() method", () => {
            it("should expose 'documents' method", () => {
                expect(instance).to.have.property('documents')
                    .to.be.a('function')
                    .to.have.lengthOf(3);
            });

            it("should return an array", () => {
                return instance.documents('someCollection')
                    .then((docs) => {
                        expect(docs).to.be.an('array');
                    });
            });
        });

        describe(".save() method", () => {
            it("should return info of insert", () => {
                return instance.save('some-collection', {doc: 'ument'})
                    .then((doc) => {
                        expect(Boolean(doc.result.ok)).to.be.true();
                    });
            });
        });
    });
});
