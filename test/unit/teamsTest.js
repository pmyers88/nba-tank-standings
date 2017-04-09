const chai = require('chai');
const _ = require('lodash');

const teams = require('../../src/teams');

chai.should();

describe('Teams', function () {
  it('should have 30 teams', function () {
    _.size(teams).should.equal(30);
  });

  describe('each team', function () {
    it('should have an "owePicksTo" key', function () {
      _.each(teams, team => team.should.contain.keys('owePicksTo'));
    });
  });
});
