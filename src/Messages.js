const compoundSubject = require('compound-subject');
const pluralize = require('pluralize');

pluralize.addIrregularRule('is', 'are');

const messages = {
  HELP_MESSAGE: 'NBA Tank Rankings can tell you the latest standings for the NBA draft lottery. Try asking, ' +
      'what are the tank rankings, tell me the top 5 teams, where do the Sixers stand, or simulate the lottery.',
  STOP_MESSAGE: 'Ok, goodbye!',
  getTankRankingsMessage: (teams) => {
    return `The top${teams.length > 1 ? ' ' + teams.length : ''} ${pluralize('team', teams.length)} in the tank ` +
        `rankings ${pluralize('is', teams.length)} ${compoundSubject(teams).delimitAll().make()}.`;
  }
};

module.exports = messages;
