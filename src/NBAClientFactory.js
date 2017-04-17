'use strict';

const NBAHttpClient = require('./NBAHttpClient');
const NBAStaticClient = require('./NBAStaticClient');

const getNBAClient = () => {
  const date = new Date();
  // if it's during the season, use the HTTP client to get fresh standings; else use the static standings
  return date.getMonth() <= process.env.LAST_MONTH_OF_REG_SEASON && date.getDate() <= process.env.LAST_DAY_OF_REG_SEASON
      ? NBAHttpClient : NBAStaticClient;
};

module.exports = {
  getNBAClient: getNBAClient
};
