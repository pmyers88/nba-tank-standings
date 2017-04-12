'use strict';

require('dotenv').config();

process.env.APP_ID = 'amzn1.ask.skill.UUID';

const lambdaLocal = require('lambda-local');
const winston = require('winston');
const chai = require('chai');
const sinon = require('sinon');
const _ = require('lodash');

const index = require('../../index');
const shared = require('./sharedBehavior');
const intentRequest = require('../fixtures/intentRequest');
const NBAClient = require('../../src/NBAClient');

chai.should();

const handler = 'handler';
const timeout = 3000;
winston.add(winston.transports.File, { filename: 'tests.log' })
       .remove(winston.transports.Console);
lambdaLocal.setLogger(winston);

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
      winston.log(this.err);
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
        }, 'IntentRequest');
        const callLambdaTankFn = callLambdaFn.bind(this);
        callLambdaTankFn(done, event);
      });

      after(function () {
        this.done = null;
        this.err = null;
      });

      const text = `The top ${process.env.NUM_TEAMS} teams in the tank standings are the`;
      const cardTitle = 'NBA Tank Standings';
      const cardText = `The top ${process.env.NUM_TEAMS} teams in the tank standings are:\n`;
      shared.shouldBehaveLikeTellWithCard(text, cardTitle, cardText);
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
    describe('should behave like tell with card when there are no errors', function () {
      let random;

      before(function (done) {
        const event = intentRequest.getRequest({
          'name': 'GetLotterySimulation',
          'slots': {}
        });

        random = sinon.stub(_, 'random');
        random.onCall(0).returns(725);
        random.onCall(1).returns(2);
        random.onCall(2).returns(200);

        const callLambdaLottoSimFn = callLambdaFn.bind(this);
        callLambdaLottoSimFn(done, event);
      });

      after(function () {
        this.done = null;
        this.err = null;
        _.random.restore();
      });

      const text = 'After simulating the lottery, the new draft order is the 76ers, the Celtics from the Nets, the Suns, the 76ers from the Lakers, ' +
          'the Magic, the Knicks, the Timberwolves, the Mavericks, the Kings, the Kings from the Pelicans, the Hornets, the Pistons, ' +
          'the Nuggets, and the Heat. A card with this information has been added to your Alexa app.';
      const cardTitle = 'Lottery Simulation Standings';
      const cardText = 'After simulating the lottery, the new draft order is:\n1. 76ers\n2. Celtics (from the Nets)\n3. Suns\n' +
          '4. 76ers (from the Lakers)\n5. Magic\n6. Knicks\n7. Timberwolves\n8. Mavericks\n9. Kings\n10. Kings (from the Pelicans)\n11. Hornets\n' +
          '12. Pistons\n13. Nuggets\n14. Heat';
      shared.shouldBehaveLikeTellWithCard(text, cardTitle, cardText);
    });

    describe('should emit appropriate error when there is an NBAClient#getStandingsRequest error', function () {
      let handleRequest;

      before(function (done) {
        const event = intentRequest.getRequest({
          'name': 'GetLotterySimulation',
          'slots': {}
        });

        handleRequest = sinon.stub(NBAClient, '_handleRequest');
        const expected = {statusCode: 400, json: {}};
        handleRequest.callsArgWith(1, expected);

        const callLambdaLottoErrorFn = callLambdaFn.bind(this);
        callLambdaLottoErrorFn(done, event);
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

      const text = `The top 7 teams in the tank standings are`;
      const cardTitle = 'NBA Tank Standings';
      const cardText = `The top 7 teams in the tank standings are:\n`;
      shared.shouldBehaveLikeTellWithCard(text, cardTitle, cardText);
    });

    describe('should emit ask the user to repeat themselves when the NumTeams slot is null', function () {
      before(function (done) {
        const event = intentRequest.getRequest({
          'name': 'GetTopNTankStandings',
          'slots': {
            'NumTeams': {
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

    describe('should emit appropriate error when there is an NBAClient#getStandingsRequest error', function () {
      let handleRequest;

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

        handleRequest = sinon.stub(NBAClient, '_handleRequest');
        const expected = {statusCode: 400, json: {}};
        handleRequest.callsArgWith(1, expected);

        const callLambdaTopNReqErrorFn = callLambdaFn.bind(this);
        callLambdaTopNReqErrorFn(done, event);
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

  describe('#GetTeamStandings', function () {
    describe('should handle team name with extra words', function () {
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

      const message = 'The 76ers currently hold the';
      const title = '76ers Tank Standings';
      shared.shouldBehaveLikeTellWithCard(message, title, message);
    });

    describe('should handle the string sixers', function () {
      before(function (done) {
        const event = intentRequest.getRequest({
          'name': 'GetTeamStandings',
          'slots': {
            'Team': {
              'name': 'Team',
              'value': 'sixers'
            }
          }
        });
        const callLambdaTeamRank1Fn = callLambdaFn.bind(this);
        callLambdaTeamRank1Fn(done, event);
      });

      after(function () {
        this.done = null;
        this.err = null;
      });

      const message = 'The 76ers currently hold the';
      const title = '76ers Tank Standings';
      shared.shouldBehaveLikeTellWithCard(message, title, message);
    });

    describe('should handle the string seventy-sixers', function () {
      before(function (done) {
        const event = intentRequest.getRequest({
          'name': 'GetTeamStandings',
          'slots': {
            'Team': {
              'name': 'Team',
              'value': 'seventy-sixers'
            }
          }
        });
        const callLambdaTeamRank2Fn = callLambdaFn.bind(this);
        callLambdaTeamRank2Fn(done, event);
      });

      after(function () {
        this.done = null;
        this.err = null;
      });

      const message = 'The 76ers currently hold the';
      const title = '76ers Tank Standings';
      shared.shouldBehaveLikeTellWithCard(message, title, message);
    });

    describe('should say that the warriors don\'t have any picks', function () {
      before(function (done) {
        const event = intentRequest.getRequest({
          'name': 'GetTeamStandings',
          'slots': {
            'Team': {
              'name': 'Team',
              'value': 'warriors'
            }
          }
        });
        const callLambdaTeamRank3Fn = callLambdaFn.bind(this);
        callLambdaTeamRank3Fn(done, event);
      });

      after(function () {
        this.done = null;
        this.err = null;
      });

      const message = 'The Warriors currently don\'t hold any draft picks in the first round.';
      const title = 'Warriors Tank Standings';
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
      }, 'IntentRequest');
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
