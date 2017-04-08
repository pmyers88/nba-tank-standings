const chai = require('chai');
const _ = require('lodash');

const handlers = require('../../src/handlers');
const intents = require('../../src/intents');
const events = require('../../src/events');

chai.should();

describe('handlers', function () {
  it('should have the same number of methods as intents.length + events.length', function () {
    _.size(handlers).should.equal(_.size(intents) + _.size(events));
  });
  it('should have a key for every value in intents', function () {
    handlers.should.have.any.keys(_.values(intents));
  });
  it('should have a key for every value in events', function () {
    handlers.should.have.any.keys(_.values(events));
  });
});
