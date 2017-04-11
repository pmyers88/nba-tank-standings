const http = require('http');
const winston = require('winston');
const _ = require('lodash');

const endpoint = 'data.nba.net';

// Inspired by https://github.com/alexa/skill-sample-node-device-address-api/blob/master/src/AlexaDeviceAddressClient.js
class NBAClient {
  static getStandingsRequest () {
    const options = this._getRequestOptions('/data/10s/prod/v1/current/standings_conference.json');

    return new Promise((resolve, reject) => {
      this._handleRequest(options, (nbaResponse) => {
        if (nbaResponse.statusCode >= 200 && nbaResponse.statusCode <= 399) {
          const eastStandings = _.get(nbaResponse.json, 'league.standard.conference.east', []);
          const westStandings = _.get(nbaResponse.json, 'league.standard.conference.west', []);
          let leagueStandings = eastStandings.concat(westStandings);
          leagueStandings = _.orderBy(leagueStandings, team => team.sortKey.winPct, ['desc']);
          resolve(leagueStandings);
        } else {
          reject(new Error(`Received invalid HTTP response code: ${nbaResponse.statusCode}`));
        }
      }, reject);
    });
  }

  static _handleRequest (options, resolve, reject) {
    http.get(options, response => {
      let rawData = '';
      response.on('data', (chunk) => {
        rawData += chunk;
      });
      response.on('end', () => {
        let responseJSON;
        try {
          responseJSON = {
            statusCode: response.statusCode,
            json: JSON.parse(rawData)
          };
        } catch (e) {
          winston.error('NBAClient JSON error: ' + e.message);
          reject(e);
        }

        resolve(responseJSON);
      });
    }).on('error', e => {
      winston.error('NBA Client error: ' + e);
      reject(e);
    });
  }

  static _getRequestOptions (path) {
    return {
      hostname: endpoint,
      path: path,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_1) AppleWebKit/537.36 (KHTML, like Gecko) ' +
        'Chrome/56.0.2924.87 Safari/537.36',
        'Accept': 'application/json'
      }
    };
  }
}

module.exports = NBAClient;
