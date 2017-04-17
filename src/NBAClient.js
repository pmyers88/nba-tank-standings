'use strict';

const _ = require('lodash');

class NBAClient {
  static getStandingsRequest () {}

  static getLeagueStandings (nbaResponse) {
    const eastStandings = _.get(nbaResponse, 'league.standard.conference.east', []);
    const westStandings = _.get(nbaResponse, 'league.standard.conference.west', []);
    let leagueStandings = eastStandings.concat(westStandings);
    leagueStandings = _.orderBy(leagueStandings, ['winPct', 'confRank'], ['asc', 'desc']);
    return leagueStandings;
  }
}

module.exports = NBAClient;
