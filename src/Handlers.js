const winston = require('winston');

const NBAClient = require('./NBAClient');
const teams = require('./teams');
const messages = require('./messages');
const intents = require('./intents');
const events = require('./events');

const NUM_TEAMS = process.env.NUM_TEAMS;

const _getTopNTeams = function (numTeams) {
  const standingsRequest = NBAClient.getStandingsRequest();
  standingsRequest.then(standingsResponse => {
    const topTeams = standingsResponse.slice(0, numTeams).map(team => {
      return 'the ' + teams[team.teamId].nickname;
    });
    const speechOutput = messages.getTankStandingsMessage(topTeams);
    this.emit(':tellWithCard', speechOutput, messages.TANK_STANDINGS_CARD_TITLE,
        speechOutput);
  });

  standingsRequest.catch(error => {
    winston.error(error.message);
    this.emit(':tell', messages.STANDINGS_REQUEST_ERROR);
  });
};

const newSessionRequestHandler = function () {
  winston.info('Starting newSessionRequestHandler()');

  if (this.event.request.type === events.LAUNCH_REQUEST) {
    this.emit(events.LAUNCH_REQUEST);
  } else if (this.event.request.type === events.SESSION_ENDED) {
    this.emit(events.SESSION_ENDED);
  } else if (this.event.request.type === 'IntentRequest') {
    this.emit(this.event.request.intent.name);
  }

  winston.info('Ending newSessionRequestHandler()');
};

const launchRequestHandler = function () {
  winston.info('Starting launchRequestHandler()');

  this.emit(':ask', messages.WELCOME_MESSAGE, messages.WELCOME_REPROMPT);

  winston.info('Ending launchRequestHandler()');
};

const getTankStandingsHandler = function () {
  winston.info('Starting getTankStandingsHandler()');

  const getTopNTeams = _getTopNTeams.bind(this);
  getTopNTeams(NUM_TEAMS);

  winston.info('Ending getTankStandingsHandler()');
};

const getLotterySimulationHandler = function () {
  winston.info('Starting getLotterySimulationHandler()');
  winston.info('Ending getLotterySimulationHandler()');
};

const getTopNTankStandingsHandler = function () {
  winston.info('Starting getTopNTankStandingsHandler()');

  const numTeamsSlot = this.event.request.intent.slots.NumTeams;
  const numTeams = numTeamsSlot && numTeamsSlot.value ? numTeamsSlot.value : null;

  if (numTeams) {
    const getTopNTeams = _getTopNTeams.bind(this);
    getTopNTeams(numTeams);
  } else {
    this.emit(':ask', messages.NUMBER_NOT_HEARD, messages.NUMBER_NOT_HEARD);
  }

  winston.info('Ending getTopNTankStandingsHandler()');
};

const getTeamStandingsHandler = function () {
  winston.info('Starting getTeamStandingsHandler()');

  const standingsRequest = NBAClient.getStandingsRequest();
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
        const teamStandingsText = messages.getTeamStandingsMessage(officialTeamNickname, foundIndex + 1);
        this.emit(':tellWithCard', teamStandingsText, messages.getTankStandingsCardTitle(officialTeamNickname),
            teamStandingsText);
      } else {
        this.emit(':ask', messages.getTeamNotFoundError(teamName), messages.getTeamNotFoundError(teamName));
      }
    });

    standingsRequest.catch(error => {
      winston.error(error.message);
      this.emit(':tell', messages.STANDINGS_REQUEST_ERROR);
    });
  } else {
    this.emit(':ask', messages.TEAM_NOT_HEARD_ERROR, messages.TEAM_NOT_HEARD_ERROR);
  }

  winston.info('Ending getTeamStandingsHandler()');
};

const amazonHelpHandler = function () {
  winston.info('Starting amazonHelpHandler()');

  this.emit(':ask', messages.HELP_MESSAGE, messages.HELP_MESSAGE);

  winston.info('Ending amazonHelpHandler()');
};

const amazonCancelHandler = function () {
  winston.info('Starting amazonCancelHandler()');

  this.emit(events.SESSION_ENDED);

  winston.info('Ending amazonCancelHandler()');
};

const amazonStopHandler = function () {
  winston.info('Starting amazonStopHandler()');

  this.emit(events.SESSION_ENDED);

  winston.info('Ending amazonStopHandler()');
};

const sessionEndedRequestHandler = function () {
  winston.info('Starting newSessionRequestHandler()');

  this.emit(':tell', messages.STOP_MESSAGE);

  winston.info('Ending newSessionRequestHandler()');
};

const unhandledRequestHandler = function () {
  winston.info('Starting unhandledRequestHandler()');

  this.emit(':ask', messages.UNHANDLED_MESSAGE, messages.HELP_MESSAGE);

  winston.info('Ending unhandledRequestHandler()');
};

const handlers = {};

handlers[intents.GET_TANK_STANDINGS] = getTankStandingsHandler;
handlers[intents.GET_LOTTERY_SIMULATION] = getLotterySimulationHandler;
handlers[intents.GET_TOP_N_TANK_STANDINGS] = getTopNTankStandingsHandler;
handlers[intents.GET_TEAM_STANDINGS] = getTeamStandingsHandler;
handlers[intents.AMAZON_HELP] = amazonHelpHandler;
handlers[intents.AMAZON_CANCEL] = amazonCancelHandler;
handlers[intents.AMAZON_STOP] = amazonStopHandler;

handlers[events.NEW_SESSION] = newSessionRequestHandler;
handlers[events.LAUNCH_REQUEST] = launchRequestHandler;
handlers[events.SESSION_ENDED] = sessionEndedRequestHandler;
handlers[events.UNHANDLED] = unhandledRequestHandler;

module.exports = handlers;
