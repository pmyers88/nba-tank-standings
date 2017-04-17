'use strict';

const chai = require('chai');
const sinon = require('sinon');

const NBAClientFactory = require('../../src/NBAClientFactory');

chai.should();

const LAST_DAY = process.env.LAST_DAY_OF_REG_SEASON;
const LAST_MONTH = process.env.LAST_MONTH_OF_REG_SEASON;

describe('NBAClientFactory', function () {
  describe('getNBAClient', function () {
    describe('with date during season', function () {
      let clock;

      before(function () {
        const seasonDate = new Date(2017, LAST_MONTH, LAST_DAY);
        clock = sinon.useFakeTimers(seasonDate.getTime());
      });

      after(function () {
        clock.restore();
      });

      it('should return NBAHttpClient', function () {
        const client = NBAClientFactory.getNBAClient();
        client.name.should.equal('NBAHttpClient');
      });
    });

    describe('with date after season', function () {
      let clock;

      before(function () {
        const seasonDate = new Date(2017, LAST_MONTH + 1, LAST_DAY + 1);
        clock = sinon.useFakeTimers(seasonDate.getTime());
      });

      after(function () {
        clock.restore();
      });

      it('should return NBAStaticClient', function () {
        const client = NBAClientFactory.getNBAClient();
        client.name.should.equal('NBAStaticClient');
      });
    });
  });
});
