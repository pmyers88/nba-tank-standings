const compoundSubject = require('compound-subject');
const inflection = require('inflection');
const {inflect, ordinalize} = inflection;

const helpMessage = 'Try asking, what are the tank standings, tell me the top 5 teams, where do the Sixers stand, or ' +
    'simulate the lottery. Now, what can I help you with?';

const messages = {
  HELP_MESSAGE: helpMessage,
  STOP_MESSAGE: 'Ok, goodbye!',
  TANK_RANKINGS_CARD_TITLE: 'NBA Tank Standings',
  UNHANDLED_MESSAGE: 'Sorry, I don\'t know how to handle that request. ' + helpMessage,
  WELCOME_MESSAGE: 'Welcome to NBA Tank Standings, the app for finding out the latest info about the NBA draft lottery. ' +
      helpMessage,
  WELCOME_REPROMPT: 'For instructions on what you can say, please say help me.',
  getTankStandingsMessage: (teams) => {
    return `The top${teams.length > 1 ? ' ' + teams.length : ''} ${inflect('team', teams.length)} in the tank ` +
        `standings ${inflect('is', teams.length, 'is', 'are')} ${compoundSubject(teams).delimitAll().make()}.`;
  },
  getTankStandingsCardTitle: (team) => {
    return `${team} Tank Standings`;
  },
  getTeamStandingsMessage: (team, ranking) => {
    return `The ${team} are currently ranked ${ordinalize(ranking.toString())} in the tank standings.`;
  }
};

module.exports = messages;
