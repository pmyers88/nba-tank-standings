'use strict';

require('dotenv').config();

const lambdaLocal = require('lambda-local');
const chai = require('chai');
const stopRequest = require('../fixtures/stopRequest');
const index = require('../../index');

chai.should();

const handler = 'handler';
const timeout = 3000;

describe('Handlers', function () {
  describe('#AMAZON.StopIntent', function () {
    let done, err;

    before(function (cb) {
      lambdaLocal.execute({
        event: stopRequest,
        lambdaFunc: index,
        lambdaHandler: handler,
        region: process.env.AWS_REGION,
        callbackWaitsForEmptyEventLoop: false,
        timeoutMs: timeout,
        callback: function (_err, _done) {
          done = _done;
          err = _err;
          console.log(err);
          cb();
        }
      });
    });

    it('should return outputSpeech matching string', function () {
      done.response.outputSpeech.ssml.should.equal('<speak> Ok, goodbye! </speak>');
    });
  });

  describe('#AMAZON.CancelIntent', function () {

  });

  describe('#AMAZON.HelpIntent', function () {

  });

  describe('#GetTankRankings', function () {

  });

  describe('#GetLotterySimulation', function () {

  });

  describe('#GetTopNTankRankings', function () {

  });

  describe('#GetTeamRankings', function () {

  });
});
