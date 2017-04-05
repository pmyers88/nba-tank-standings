'use strict';

require('dotenv').config();
import Alexa from 'alexa-sdk';

const APP_ID = process.env.APP_ID;

const languageStrings = {
  'en': {
    'translation': {
      'HELP_MESSAGE': 'NBA Tank Rankings can tell you the latest standings for the NBA draft lottery. Try asking, ' +
      'what are the tank rankings, tell me the top 5 teams, where do the Sixers stand, or simulate the lottery.',
      'STOP_MESSAGE': 'Ok, goodbye!'
    }
  }
};

exports.handler = function (event, context, callback) {
  const alexa = Alexa.handler(event, context);
  alexa.APP_ID = APP_ID;
  alexa.resources = languageStrings;
  alexa.registerHandlers(handlers);
  alexa.execute();
};

const handlers = {
  'AMAZON.HelpIntent': function () {
    this.emit(':ask', this.t('HELP_MESSAGE'), this.t('HELP_MESSAGE'));
  },

  'AMAZON.CancelIntent': function () {
    this.emit(':tell', this.t('STOP_MESSAGE'));
  },

  'AMAZON.StopIntent': function () {
    this.emit(':tell', this.t('STOP_MESSAGE'));
  }
};
