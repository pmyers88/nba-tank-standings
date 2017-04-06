'use strict';
const compoundSubject = require('compound-subject');
require('dotenv').config();

const Alexa = require('alexa-sdk');
const NBAClient = require('./src/NBAClient');
const teams = require('./src/teams');

const APP_ID = process.env.APP_ID;
const NUM_TEAMS = process.env.NUM_TEAMS;

const strings = {
  'HELP_MESSAGE': 'NBA Tank Rankings can tell you the latest standings for the NBA draft lottery. Try asking, ' +
  'what are the tank rankings, tell me the top 5 teams, where do the Sixers stand, or simulate the lottery.',
  'STOP_MESSAGE': 'Ok, goodbye!'
};

exports.handler = function (event, context, callback) {
  let alexa = Alexa.handler(event, context);
  alexa.APP_ID = APP_ID;
  alexa.registerHandlers(handlers);
  alexa.execute();
};

const handlers = {
  'GetTankRankings': function () {
    const nbaClient = new NBAClient();
    console.log('Getting tank rankings');
    nbaClient.getStandingsJSON(standingsResponse => {
      if (standingsResponse.statusCode >= 200 && standingsResponse.statusCode <= 399) {
        const topThree = standingsResponse.standingsJSON.slice(0, NUM_TEAMS).map(team => 'the ' + teams.league.standard[team.teamId].nickname);
        this.emit(':tell', 'The top ' + NUM_TEAMS + ' teams in the tank rankings are ' + compoundSubject(topThree).delimitAll().make());
      }
    });
  },

  'AMAZON.HelpIntent': function () {
    this.emit(':ask', strings.HELP_MESSAGE, strings.HELP_MESSAGE);
  },

  'AMAZON.CancelIntent': function () {
    this.emit(':tell', strings.STOP_MESSAGE);
  },

  'AMAZON.StopIntent': function () {
    this.emit(':tell', strings.STOP_MESSAGE);
  }
};
