const NBAClient = require('./NBAClient');
const teams = require('./Teams');
const messages = require('./Messages');

const NUM_TEAMS = process.env.NUM_TEAMS;

const handlers = {
  'GetTankRankings': function () {
    const nbaClient = new NBAClient();
    console.log('Getting tank rankings');
    nbaClient.getStandingsJSON(standingsResponse => {
      if (standingsResponse.statusCode >= 200 && standingsResponse.statusCode <= 399) {
        const topTeams = standingsResponse.standingsJSON.slice(0, NUM_TEAMS).map(team => {
          return 'the ' + teams[team.teamId].nickname;
        });
        this.emit(':tell', messages.getTankRankingsMessage(topTeams));
      }
    });
  },

  'AMAZON.HelpIntent': function () {
    this.emit(':ask', messages.HELP_MESSAGE, messages.HELP_MESSAGE);
  },

  'AMAZON.CancelIntent': function () {
    this.emit(':tell', messages.STOP_MESSAGE);
  },

  'AMAZON.StopIntent': function () {
    this.emit(':tell', messages.STOP_MESSAGE);
  }
};

module.exports = handlers;
