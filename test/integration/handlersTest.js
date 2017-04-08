'use strict';

require('dotenv').config();

process.env.APP_ID = 'amzn1.ask.skill.UUID';

const lambdaLocal = require('lambda-local');
const chai = require('chai');
const index = require('../../index');
const shared = require('./sharedBehavior');
const intentRequest = require('../fixtures/intentRequest');

chai.should();

const handler = 'handler';
const timeout = 3000;

const callLambdaFn = function (mochaDone, event) {
  lambdaLocal.execute({
    event: event,
    lambdaFunc: index,
    lambdaHandler: handler,
    region: process.env.AWS_REGION,
    callbackWaitsForEmptyEventLoop: false,
    timeoutMs: timeout,
    callback: (_err, _done) => {
      this.done = _done;
      this.err = _err;
      console.log(this.err);
      mochaDone();
    }
  });
};

describe('Handlers', function () {
  this.done = null;
  this.err = null;

  describe('#LaunchRequest', function () {
    before(function (done) {
      const event = intentRequest.getRequest(null, 'LaunchRequest');
      const callLambdaLaunchFn = callLambdaFn.bind(this);
      callLambdaLaunchFn(done, event);
    });

    after(function () {
      this.done = null;
      this.err = null;
    });

    const welcomeMessage = 'Welcome to NBA Tank Rankings, the app for finding out the latest info about the NBA draft' +
      ' lottery. Try asking, what are the tank rankings, tell me the top 5 teams, where do the Sixers stand, or ' +
      'simulate the lottery. Now, what can I help you with?';
    const welcomeReprompt = 'For instructions on what you can say, please say help me.';
    shared.shouldBehaveLikeAskWithReprompt(welcomeMessage, welcomeReprompt);
  });

  describe('#GetTankRankings', function () {
    before(function (done) {
      const event = intentRequest.getRequest({
        'name': 'GetTankRankings',
        'slots': {}
      });
      const callLambdaTankFn = callLambdaFn.bind(this);
      callLambdaTankFn(done, event);
    });

    after(function () {
      this.done = null;
      this.err = null;
    });

    shared.shouldBehaveLikeTell(`The top ${process.env.NUM_TEAMS} teams in the tank rankings are the`);
  });

  describe('#GetLotterySimulation', function () {

  });

  describe('#GetTopNTankRankings', function () {

  });

  describe('#GetTeamRankings', function () {
    before(function (done) {
      const event = intentRequest.getRequest({
        'name': 'GetTeamRankings',
        'slots': {
          'Team': {
            'name': 'Team',
            'value': '76ers standings'
          }
        }
      });
      const callLambdaTeamRankFn = callLambdaFn.bind(this);
      callLambdaTeamRankFn(done, event);
    });

    after(function () {
      this.done = null;
      this.err = null;
    });

    shared.shouldBehaveLikeTell(`The 76ers are currently ranked`);
  });

  describe('#AMAZON.HelpIntent', function () {
    before(function (done) {
      const event = intentRequest.getRequest({
        'name': 'AMAZON.HelpIntent',
        'slots': {}
      });
      const callLambdaHelpFn = callLambdaFn.bind(this);
      callLambdaHelpFn(done, event);
    });

    after(function () {
      this.done = null;
      this.err = null;
    });

    const helpText = 'Try asking, what are the tank rankings, tell me the top 5 teams, where do the Sixers stand, or ' +
        'simulate the lottery. Now, what can I help you with?';
    shared.shouldBehaveLikeAskWithReprompt(helpText, helpText);
  });

  describe('#AMAZON.CancelIntent', function () {
    before(function (done) {
      const event = intentRequest.getRequest({
        'name': 'AMAZON.CancelIntent',
        'slots': {}
      });
      const callLambdaCancelFn = callLambdaFn.bind(this);
      callLambdaCancelFn(done, event);
    });

    after(function () {
      this.done = null;
      this.err = null;
    });

    shared.shouldBehaveLikeTell('Ok, goodbye!');
  });

  describe('#AMAZON.StopIntent', function () {
    before(function (done) {
      const event = intentRequest.getRequest({
        'name': 'AMAZON.StopIntent',
        'slots': {}
      });
      const callLambdaStopFn = callLambdaFn.bind(this);
      callLambdaStopFn(done, event);
    });

    after(function () {
      this.done = null;
      this.err = null;
    });

    shared.shouldBehaveLikeTell('Ok, goodbye!');
  });

  describe('#SessionEndedRequest', function () {
    before(function (done) {
      const event = intentRequest.getRequest(null, 'SessionEndedRequest');
      const callLambdaStopFn = callLambdaFn.bind(this);
      callLambdaStopFn(done, event);
    });

    after(function () {
      this.done = null;
      this.err = null;
    });

    shared.shouldBehaveLikeTell('Ok, goodbye!');
  });

  describe('#Unhandled', function () {
    before(function (done) {
      const event = intentRequest.getRequest({
        'name': 'Unhandled',
        'slots': {}
      });
      const callLambdaUnhandledFn = callLambdaFn.bind(this);
      callLambdaUnhandledFn(done, event);
    });

    after(function () {
      this.done = null;
      this.err = null;
    });

    const helpText = 'Try asking, what are the tank rankings, tell me the top 5 teams, where do the Sixers stand, or ' +
        'simulate the lottery. Now, what can I help you with?';
    const unhandledText = 'Sorry, I don\'t know how to handle that request. ' + helpText;
    shared.shouldBehaveLikeAskWithReprompt(unhandledText, helpText);
  });
});
