const NBAClient = require('./NBAClient');
const teams = require('./teams');
const messages = require('./messages');
const intents = require('./intents');
const events = require('./events');

const NUM_TEAMS = process.env.NUM_TEAMS;

const newSessionRequestHandler = function () {
  console.info('Starting newSessionRequestHandler()');

  if (this.event.request.type === events.LAUNCH_REQUEST) {
    this.emit(events.LAUNCH_REQUEST);
  } else if (this.event.request.type === events.SESSION_ENDED) {
    this.emit(events.SESSION_ENDED);
  } else if (this.event.request.type === 'IntentRequest') {
    this.emit(this.event.request.intent.name);
  }

  console.info('Ending newSessionRequestHandler()');
};

const launchRequestHandler = function () {
  console.info('Starting launchRequestHandler()');
  this.emit(':ask', messages.WELCOME_MESSAGE, messages.WELCOME_REPROMPT);
  console.info('Ending launchRequestHandler()');
};

const getTankRankingsHandler = function () {
  console.info('Starting getTankRankingsHandler()');
  const nbaClient = new NBAClient();
  const standingsRequest = nbaClient.getStandingsRequest();
  standingsRequest.then(standingsResponse => {
    const topTeams = standingsResponse.slice(0, NUM_TEAMS).map(team => {
      return 'the ' + teams[team.teamId].nickname;
    });
    this.emit(':tell', messages.getTankRankingsMessage(topTeams));
  });

  standingsRequest.catch(error => {
    console.error(error.message);
    this.emit(':tell', 'An error occurred');
  });
  console.info('Ending getTankRankingsHandler()');
};

const getLotterySimulationHandler = function () {
  console.info('Starting getLotterySimulationHandler()');
  console.info('Ending getLotterySimulationHandler()');
};

const getTopNTankRankingsHandler = function () {
  console.info('Starting getTopNTankRankingsHandler()');
  console.info('Ending getTopNTankRankingsHandler()');
};

const getTeamRankingsHandler = function () {
  console.info('Starting getTeamRankingsHandler()');
  const nbaClient = new NBAClient();
  const standingsRequest = nbaClient.getStandingsRequest();
  const teamSlot = this.event.request.intent.slots.Team;
  const teamName = teamSlot && teamSlot.value ? teamSlot.value : null;

  if (teamName) {
    standingsRequest.then(standingsResponse => {
      let foundIndex;
      let officialTeamNickname;
      const team = standingsResponse.find((team, index) => {
        foundIndex = index;
        officialTeamNickname = teams[team.teamId].nickname;
        return teamName.includes(teams[team.teamId].nickname);
      });
      if (team) {
        this.emit(':tell', messages.getTeamRankingsMessage(officialTeamNickname, foundIndex + 1));
      } else {
        this.emit(':tell', `Could not find the team ${teamName}`);
      }
    });

    standingsRequest.catch(error => {
      console.error(error.message);
      this.emit(':tell', 'An error occurred');
    });
  } else {
    this.emit(':tell', 'I didn\'t hear your request correctly.');
  }
  console.info('Ending amazonCancelHandler()');
};

const amazonHelpHandler = function () {
  console.info('Starting amazonHelpHandler()');
  this.emit(':ask', messages.HELP_MESSAGE, messages.HELP_MESSAGE);
  console.info('Ending amazonHelpHandler()');
};

const amazonCancelHandler = function () {
  console.info('Starting amazonCancelHandler()');
  this.emit(events.SESSION_ENDED);
  console.info('Ending amazonCancelHandler()');
};

const amazonStopHandler = function () {
  console.info('Starting amazonStopHandler()');
  this.emit(events.SESSION_ENDED);
  console.info('Ending amazonStopHandler()');
};

const sessionEndedRequestHandler = function () {
  console.info('Starting newSessionRequestHandler()');
  this.emit(':tell', messages.STOP_MESSAGE);
  console.info('Ending newSessionRequestHandler()');
};

const unhandledRequestHandler = function () {
  console.info('Starting unhandledRequestHandler()');
  this.emit(':ask', messages.UNHANDLED_MESSAGE, messages.HELP_MESSAGE);
  console.info('Ending unhandledRequestHandler()');
};

const handlers = {};

handlers[intents.GET_TANK_RANKINGS] = getTankRankingsHandler;
handlers[intents.GET_LOTTERY_SIMULATION] = getLotterySimulationHandler;
handlers[intents.GET_TOP_N_TANK_RANKINGS] = getTopNTankRankingsHandler;
handlers[intents.GET_TEAM_RANKINGS] = getTeamRankingsHandler;
handlers[intents.AMAZON_HELP] = amazonHelpHandler;
handlers[intents.AMAZON_CANCEL] = amazonCancelHandler;
handlers[intents.AMAZON_STOP] = amazonStopHandler;

handlers[events.NEW_SESSION] = newSessionRequestHandler;
handlers[events.LAUNCH_REQUEST] = launchRequestHandler;
handlers[events.SESSION_ENDED] = sessionEndedRequestHandler;
handlers[events.UNHANDLED] = unhandledRequestHandler;

module.exports = handlers;
