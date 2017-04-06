const http = require('http');
const _ = require('lodash');

// Inspired by https://github.com/alexa/skill-sample-node-device-address-api/blob/master/src/AlexaDeviceAddressClient.js
class NBAClient {
  constructor () {
    this.endpoint = 'data.nba.net';
  }

  getStandingsJSON (callback) {
    let standingsRequest = this._getStandingsRequest();

    standingsRequest.then(callback);
  }

  _getStandingsRequest () {
    const options = this._getRequestOptions('/data/10s/prod/v1/current/standings_conference.json');

    return new Promise((resolve, reject) => {
      this._handleRequest(options, resolve, reject);
    });
  }

  _handleRequest (options, resolve, reject) {
    http.get(options, response => {
      let rawData = '';
      response.on('data', (chunk) => {
        rawData += chunk;
      });
      response.on('end', () => {
        const standingsJSON = JSON.parse(rawData);
        const eastStandings = _.get(standingsJSON, 'league.standard.conference.east', []);
        const westStandings = _.get(standingsJSON, 'league.standard.conference.west', []);
        let leagueStandings = eastStandings.concat(westStandings);
        leagueStandings = _.orderBy(leagueStandings, team => team.sortKey.winPct, ['desc']);
        const nbaResponse = {
          statusCode: response.statusCode,
          standingsJSON: leagueStandings
        };

        resolve(nbaResponse);
      }).on('error', e => {
        console.error(e);
        reject();
      });
    });
  }

  _getRequestOptions (path) {
    return {
      hostname: this.endpoint,
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
