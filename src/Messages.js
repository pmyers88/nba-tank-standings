const compoundSubject = require('compound-subject');
const inflection = require('inflection');
const {inflect, ordinalize} = inflection;

const helpMessage = 'Try asking, what are the tank rankings, tell me the top 5 teams, where do the Sixers stand, or ' +
    'simulate the lottery. Now, what can I help you with?';

const messages = {
  GET_TANK_RANKINGS_CARD_TITLE: 'NBA Tank Standings',
  HELP_MESSAGE: helpMessage,
  STOP_MESSAGE: 'Ok, goodbye!',
  UNHANDLED_MESSAGE: 'Sorry, I don\'t know how to handle that request. ' + helpMessage,
  WELCOME_MESSAGE: 'Welcome to NBA Tank Rankings, the app for finding out the latest info about the NBA draft lottery. ' +
      helpMessage,
  WELCOME_REPROMPT: 'For instructions on what you can say, please say help me.',
  getTankRankingsMessage: (teams) => {
    return `The top${teams.length > 1 ? ' ' + teams.length : ''} ${inflect('team', teams.length)} in the tank ` +
        `rankings ${inflect('is', teams.length, 'is', 'are')} ${compoundSubject(teams).delimitAll().make()}.`;
  },
  getTeamRankingsMessage: (team, ranking) => {
    return `The ${team} are currently ranked ${ordinalize(ranking.toString())} in the tank standings.`;
  }
};

module.exports = messages;
