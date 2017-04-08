const chai = require('chai');
const _values = require('lodash/values');
const _size = require('lodash/size');

const handlers = require('../../src/handlers');
const intents = require('../../src/intents');
const events = require('../../src/events');

chai.should();

describe('handlers', function () {
  it('should have the same number of methods as intents.length + events.length', function () {
    _size(handlers).should.equal(_size(intents) + _size(events));
  });
  it('should have a key for every value in intents', function () {
    handlers.should.have.any.keys(_values(intents));
  });
  it('should have a key for every value in events', function () {
    handlers.should.have.any.keys(_values(events));
  });
});
