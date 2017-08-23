const ObjectID = require('mongodb').ObjectID;
const testHelpers = require('@quoin/node-test-helpers');

const moduleToTest = require('./convert-objectid-to-string');

const expect = testHelpers.expect;

describe("lib/convert-objectid-to-string", () => {
    it("should expose a function with 1 param", () => {
        expect(moduleToTest).to.be.a('function').to.have.lengthOf(1);
    });

    it("should convert _id", () => {
        const doc = {
            _id: ObjectID('123456789abcde123456789a')
        };

        const value = moduleToTest(doc);

        expect(value).to.deep.equal({
            id: '123456789abcde123456789a'
        });
    });

    it("should convert parentID", () => {
        const doc = {
            parentID: ObjectID('123456789abcde123456789a')
        };

        const value = moduleToTest(doc);

        expect(value).to.deep.equal({
            parentID: '123456789abcde123456789a'
        });
    });

    it("should convert both _id and parentID", () => {
        const doc = {
            _id: ObjectID('a987654321edcba987654321'),
            parentID: ObjectID('123456789abcde123456789a')
        };

        const value = moduleToTest(doc);

        expect(value).to.deep.equal({
            id: 'a987654321edcba987654321',
            parentID: '123456789abcde123456789a'
        });
    });

    it("should not affect 'id' if '_id' not defined", () => {
        const doc = {
            id: ObjectID("DON'T CHANGE")
        };

        const value = moduleToTest(doc);

        expect(value).to.deep.equal({
            id: ObjectID("DON'T CHANGE")
        });
    });
});
