const Promise = require('bluebird');
const mongoMock = require('mongo-mock');
const testHelpers = require('@quoin/node-test-helpers');

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
        expect(WarpJSMongoPersistence).to.be.a('function').to.have.property('name');
        expect(WarpJSMongoPersistence.name).to.equal('WarpJSMongoPersistence');
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
            return Promise.resolve()
                .then(() => instance._connection)
                .then(() => instance._connection)
                .finally(() => instance.close())
            ;
        });

        describe(".close()", () => {
            it("should expose 'close()' method", () => {
                expect(instance).to.have.property('close');
                expect(instance.close).to.be.a('function').to.have.lengthOf(1);
            });

            it("should be able to call without param", () => {
                return Promise.resolve()
                    .then(() => instance.close())
                    .catch((err) => {
                        expect(err).to.be.undefined();
                    })
                    .finally(() => instance.close())
                ;
            });

            it("should be able to call with param", () => {
                return Promise.resolve()
                    .then(() => instance.close(true))
                    .catch((err) => {
                        expect(err).to.be.undefined();
                    })
                    .finally(() => instance.close())
                ;
            });

            it("should close because connection is open", () => {
                return Promise.resolve()
                    .then(() => instance.collections)
                    .then(() => instance.close())
                    .catch((err) => {
                        expect(err).to.be.undefined();
                    })
                    .finally(() => instance.close())
                ;
            });
        });

        // NOTE: mongo-mock doesn't implement db.admin()
        it.skip("should expose 'databases' getter", () => {
            expect(instance).to.have.property('databases');
        });

        describe(".collections", () => {
            it("should expose 'collections' getter", () => {
                return Promise.resolve()
                    .then(() => instance.collections)
                    .catch((err) => expect(err).to.be.undefined())
                    .finally(() => instance.close())
                ;
            });

            it("should be an array", () => {
                return Promise.resolve()
                    .then(() => instance.collections)
                    .then((collections) => {
                        expect(collections).to.be.an('array');
                    })
                    .finally(() => instance.close())
                ;
            });
        });

        describe(".documents() method", () => {
            it("should expose 'documents' method", () => {
                expect(instance).to.have.property('documents');
                expect(instance.documents).to.be.a('function').to.have.lengthOf(3);
            });

            it("should return an array", () => {
                return Promise.resolve()
                    .then(() => instance.documents('someCollection'))
                    .then((docs) => {
                        expect(docs).to.be.an('array');
                    })
                    .finally(() => instance.close())
                ;
            });
        });

        describe(".save() method", () => {
            it("should return info of insert", () => {
                return Promise.resolve()
                    .then(() => instance.save('some-collection', { doc: 'ument' }))
                    .then((res) => {
                        expect(res.id).not.to.be.undefined();
                    })
                    .finally(() => instance.close())
                ;
            });
        });
    });
});
