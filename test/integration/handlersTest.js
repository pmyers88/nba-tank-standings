'use strict';

require('dotenv').config();

process.env.APP_ID = 'amzn1.ask.skill.UUID';

const lambdaLocal = require('lambda-local');
const chai = require('chai');
const sinon = require('sinon');

const index = require('../../index');
const shared = require('./sharedBehavior');
const intentRequest = require('../fixtures/intentRequest');
const NBAClient = require('../../src/NBAClient');

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

    const welcomeMessage = 'Welcome to NBA Tank Standings, the app for finding out the latest info about the NBA draft' +
      ' lottery. Try asking, what are the tank standings, tell me the top 5 teams, where do the Sixers stand, or ' +
      'simulate the lottery. Now, what can I help you with?';
    const welcomeReprompt = 'For instructions on what you can say, please say help me.';
    shared.shouldBehaveLikeAskWithReprompt(welcomeMessage, welcomeReprompt);
  });

  describe('#GetTankStandings', function () {
    describe('should behave like tell with card when there are no errors', function () {
      before(function (done) {
        const event = intentRequest.getRequest({
          'name': 'GetTankStandings',
          'slots': {}
        });
        const callLambdaTankFn = callLambdaFn.bind(this);
        callLambdaTankFn(done, event);
      });

      after(function () {
        this.done = null;
        this.err = null;
      });

      const text = `The top ${process.env.NUM_TEAMS} teams in the tank standings are the`;
      const cardTitle = 'NBA Tank Standings';
      shared.shouldBehaveLikeTellWithCard(text, cardTitle, text);
    });

    describe('should emit appropriate error when there is an NBAClient#getStandingsRequest error', function () {
      let handleRequest;

      before(function (done) {
        const event = intentRequest.getRequest({
          'name': 'GetTankStandings',
          'slots': {}
        });

        handleRequest = sinon.stub(NBAClient, '_handleRequest');
        const expected = {statusCode: 400, json: {}};
        handleRequest.callsArgWith(1, expected);

        const callLambdaTankErrorFn = callLambdaFn.bind(this);
        callLambdaTankErrorFn(done, event);
      });

      after(function () {
        this.done = null;
        this.err = null;
        NBAClient._handleRequest.restore();
      });

      const message = 'There was an error trying to fetch the latest NBA standings. Please try again later.';
      shared.shouldBehaveLikeTell(message);
    });
  });

  describe('#GetLotterySimulation', function () {

  });

  describe('#GetTopNTankStandings', function () {
    describe('should behave like tell with card when there are no errors', function () {
      before(function (done) {
        const event = intentRequest.getRequest({
          'name': 'GetTopNTankStandings',
          'slots': {
            'NumTeams': {
              'name': 'NumTeams',
              'value': '7'
            }
          }
        });
        const callLambdaTopNFn = callLambdaFn.bind(this);
        callLambdaTopNFn(done, event);
      });

      after(function () {
        this.done = null;
        this.err = null;
      });

      const text = `The top 7 teams in the tank standings are the`;
      const cardTitle = 'NBA Tank Standings';
      shared.shouldBehaveLikeTellWithCard(text, cardTitle, text);
    });

    describe('should emit ask the user to repeat themselves when the NumTeams slot is null', function () {
      before(function (done) {
        const event = intentRequest.getRequest({
          'name': 'GetTopNTankStandings',
          'slots': {
            'Team': {
              'name': 'NumTeams',
              'value': null
            }
          }
        });
        const callLambdaTopNErrorFn = callLambdaFn.bind(this);
        callLambdaTopNErrorFn(done, event);
      });

      after(function () {
        this.done = null;
        this.err = null;
      });

      const message = 'I couldn\'t hear the number of teams you asked for. Please repeat your request.';
      shared.shouldBehaveLikeAskWithReprompt(message, message);
    });
  });

  describe('#GetTeamStandings', function () {
    describe('should behave like emit tell with card when there are no errors', function () {
      before(function (done) {
        const event = intentRequest.getRequest({
          'name': 'GetTeamStandings',
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

      const message = 'The 76ers are currently ranked';
      const title = '76ers Tank Standings';
      shared.shouldBehaveLikeTellWithCard(message, title, message);
    });

    describe('should emit ask the user to repeat themselves when the Team slot is null', function () {
      before(function (done) {
        const event = intentRequest.getRequest({
          'name': 'GetTeamStandings',
          'slots': {
            'Team': {
              'name': 'Team',
              'value': null
            }
          }
        });
        const callLambdaTeamRankErrorFn = callLambdaFn.bind(this);
        callLambdaTeamRankErrorFn(done, event);
      });

      after(function () {
        this.done = null;
        this.err = null;
      });

      const message = 'I couldn\'t find the team you asked about. Please repeat your request.';
      shared.shouldBehaveLikeAskWithReprompt(message, message);
    });

    describe('should emit ask the user to repeat themselves when the Team slot is not an NBA team', function () {
      before(function (done) {
        const event = intentRequest.getRequest({
          'name': 'GetTeamStandings',
          'slots': {
            'Team': {
              'name': 'Team',
              'value': 'Eagles'
            }
          }
        });
        const callLambdaTeamNotFoundErrorFn = callLambdaFn.bind(this);
        callLambdaTeamNotFoundErrorFn(done, event);
      });

      after(function () {
        this.done = null;
        this.err = null;
      });

      const message = 'Sorry, I could not find a team named Eagles. Please ask again.';
      shared.shouldBehaveLikeAskWithReprompt(message, message);
    });

    describe('should emit appropriate error when there is an NBAClient#getStandingsRequest error', function () {
      let handleRequest;

      before(function (done) {
        const event = intentRequest.getRequest({
          'name': 'GetTeamStandings',
          'slots': {
            'Team': {
              'name': 'Team',
              'value': '76ers standings'
            }
          }
        });

        handleRequest = sinon.stub(NBAClient, '_handleRequest');
        const expected = {statusCode: 400, json: {}};
        handleRequest.callsArgWith(1, expected);

        const callLambdaStandingsErrorFn = callLambdaFn.bind(this);
        callLambdaStandingsErrorFn(done, event);
      });

      after(function () {
        this.done = null;
        this.err = null;
        NBAClient._handleRequest.restore();
      });

      const message = 'There was an error trying to fetch the latest NBA standings. Please try again later.';
      shared.shouldBehaveLikeTell(message);
    });
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

    const helpText = 'Try asking, what are the tank standings, tell me the top 5 teams, where do the Sixers stand, or ' +
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

    const helpText = 'Try asking, what are the tank standings, tell me the top 5 teams, where do the Sixers stand, or ' +
        'simulate the lottery. Now, what can I help you with?';
    const unhandledText = 'Sorry, I don\'t know how to handle that request. ' + helpText;
    shared.shouldBehaveLikeAskWithReprompt(unhandledText, helpText);
  });
});
