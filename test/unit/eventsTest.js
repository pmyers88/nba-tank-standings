'use strict';

const chai = require('chai');

const events = require('../../src/events');

chai.should();

describe('Events', function () {
  it('should have NEW_SESSION intent with value NewSession', function () {
    events.NEW_SESSION.should.equal('NewSession');
  });

  it('should have LAUNCH_REQUEST intent with value LaunchRequest', function () {
    events.LAUNCH_REQUEST.should.equal('LaunchRequest');
  });

  it('should have SESSION_ENDED intent with value SessionEndedRequest', function () {
    events.SESSION_ENDED.should.equal('SessionEndedRequest');
  });

  it('should have UNHANDLEDintent with value Unhandled', function () {
    events.UNHANDLED.should.equal('Unhandled');
  });
});
