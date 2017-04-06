const compoundSubject = require('compound-subject');

const messages = {
  HELP_MESSAGE: 'NBA Tank Rankings can tell you the latest standings for the NBA draft lottery. Try asking, ' +
  'what are the tank rankings, tell me the top 5 teams, where do the Sixers stand, or simulate the lottery.',
  STOP_MESSAGE: 'Ok, goodbye!',
  getTankRankingsMessage: (numTeams, teams) => {
    return `The top ${numTeams} teams in the tank rankings are ${compoundSubject(teams).delimitAll().make()}`;
  }
};

module.exports = messages;
