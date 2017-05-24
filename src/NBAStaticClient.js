'use strict';

const _ = require('lodash');

const NBAClient = require('./NBAClient');
const finalStandings = require(`../resources/${process.env.FINAL_STANDINGS_FILE}`);

class NBAStaticClient extends NBAClient {
  static getStandingsRequest () {
    return new Promise((resolve, reject) => {
      const leagueStandings = this._getLeagueStandings(finalStandings);
      resolve(leagueStandings);
    });
  }

  static _getLeagueStandings (nbaResponse) {
    const eastStandings = _.get(nbaResponse, 'league.standard.conference.east', []);
    const westStandings = _.get(nbaResponse, 'league.standard.conference.west', []);
    let leagueStandings = eastStandings.concat(westStandings);
    leagueStandings = _.orderBy(leagueStandings, 'sortKey.draftOrder', 'asc');
    return leagueStandings;
  }
}

module.exports = NBAStaticClient;
