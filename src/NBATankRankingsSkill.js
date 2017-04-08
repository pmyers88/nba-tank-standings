'use strict';

const Alexa = require('alexa-sdk');

const handlers = require('./handlers');

const APP_ID = process.env.APP_ID;

exports.handler = function (event, context, callback) {
  let alexa = Alexa.handler(event, context);
  alexa.appId = APP_ID;
  alexa.registerHandlers(handlers);
  console.log(`Beginning execution for skill with APP_ID=${alexa.appId}`);
  alexa.execute();
  console.log(`Ending execution  for skill with APP_ID=${alexa.appId}`);
};
