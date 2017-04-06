'use strict';

require('dotenv').config();
const Alexa = require('alexa-sdk');

const handlers = require('./Handlers');

const APP_ID = process.env.APP_ID;

exports.handler = function (event, context, callback) {
  let alexa = Alexa.handler(event, context);
  alexa.APP_ID = APP_ID;
  alexa.registerHandlers(handlers);
  alexa.execute();
};
