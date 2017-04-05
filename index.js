'use strict';

require('dotenv').config();
const Alexa = require('alexa-sdk');

const APP_ID = process.env.APP_ID;

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
