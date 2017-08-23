const ObjectID = require('mongodb').ObjectID;
const testHelpers = require('@quoin/node-test-helpers');

const moduleToTest = require('./convert-string-to-objectid');

const expect = testHelpers.expect;

describe("lib/convert-string-to-objectid", () => {
    it("should expose a function with 1 param", () => {
        expect(moduleToTest).to.be.a('function').to.have.lengthOf(1);
    });

    it("should convert string doc", () => {
        const doc = '123456789a123456789b1234';

        const value = moduleToTest(doc);

        expect(value).to.deep.equal({
            _id: ObjectID('123456789a123456789b1234')
        });
    });

    it("should convert doc with 'id'", () => {
        const doc = {
            id: '123456789a123456789b1234'
        };

        const value = moduleToTest(doc);

        expect(value).to.deep.equal({
            _id: ObjectID('123456789a123456789b1234')
        });
    });

    it("should convert doc with 'parentID'", () => {
        const doc = {
            parentID: '123456789a123456789b1234'
        };

        const value = moduleToTest(doc);

        expect(value).to.deep.equal({
            parentID: ObjectID('123456789a123456789b1234')
        });
    });

    it("should convert doc with both 'id' and 'parentID'", () => {
        const doc = {
            id: '4321b987654321a987654321',
            parentID: '123456789a123456789b1234'
        };

        const value = moduleToTest(doc);

        expect(value).to.deep.equal({
            _id: ObjectID('4321b987654321a987654321'),
            parentID: ObjectID('123456789a123456789b1234')
        });
    });

    it("should not affect '_id' if 'id' not defined", () => {
        const doc = {
            _id: "DON'T CHANGE"
        };

        const value = moduleToTest(doc);

        expect(value).to.deep.equal({
            _id: "DON'T CHANGE"
        });
    });
});
