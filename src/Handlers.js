const winston = require('winston');
const _ = require('lodash');

const NBAClient = require('./NBAClient');
const teams = require('./teams');
const messages = require('./messages');
const intents = require('./intents');
const events = require('./events');
const lotteryOdds = require('./lotteryOdds');

const NUM_TEAMS = process.env.NUM_TEAMS;
const NUM_LOTTERY_TEAMS = 14;

const _resolveTrades = (teamStandings) => {
  return teamStandings.map((team, index) => {
    const teamInfo = teams[team.teamId];
    let from = teamInfo.nickname;
    let owner = from;

    _.each(teamInfo.owePicksTo, possibleTrade => {
      const otherTeamIndex = teamStandings.findIndex(team => {
        return team.teamId === (possibleTrade.otherTeamId || possibleTrade.recipientId);
      });

      if (possibleTrade.condition(index + 1, otherTeamIndex + 1)) {
        owner = teams[possibleTrade.recipientId].nickname;
      }
    });

    return {'owner': owner, 'from': from};
  });
};

const _addThe = (teams) => {
  return teams.map(team => `the ${team.owner}` + (team.owner === team.from ? '' : ` via the ${team.from}`));
};

const _numericalOutput = (teams) => {
  return teams.map((team, index) => `${index + 1}. ${team.owner}` + (team.owner === team.from ? '' : ` (via the ${team.from})`));
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

  NBAClient.getStandingsRequest().then(standingsResponse => {
    const teams = _.slice(_resolveTrades(standingsResponse), 0, NUM_TEAMS);
    const speechOutput = messages.getTankStandingsMessage(_addThe(teams));
    const cardOutput = messages.getTankStandingsText(_numericalOutput(teams));
    this.emit(':tellWithCard', speechOutput, messages.TANK_STANDINGS_CARD_TITLE, cardOutput);
  }).catch(error => {
    winston.error(error.message);
    this.emit(':tell', messages.STANDINGS_REQUEST_ERROR);
  });

  winston.info('Ending getTankStandingsHandler()');
};

const getLotterySimulationHandler = function () {
  winston.info('Starting getLotterySimulationHandler()');

  NBAClient.getStandingsRequest().then(standingsResponse => {
    const topThreeTeams = [];
    const topThreeIndices = [];
    for (let i = 1; i <= 3; i++) {
      const winnerIndex = lotteryOdds.selectWinnerForPick(i, topThreeIndices);
      topThreeTeams.push(standingsResponse[winnerIndex]);
      topThreeIndices.push(winnerIndex);
    }

    // this mutates topTeams to remove the top 3 teams
    _.remove(standingsResponse, (team, i) => topThreeIndices.findIndex(topThreeIndex => i === topThreeIndex) !== -1);

    const newStandings = _.slice(_resolveTrades(topThreeTeams.concat(standingsResponse)), 0, NUM_LOTTERY_TEAMS);
    const speechOutput = messages.getLotterySimulationMessage(_addThe(newStandings));
    const cardOutput = messages.getLotterySimulationText(_numericalOutput(newStandings));
    this.emit(':tellWithCard', speechOutput, messages.LOTTERY_SIMULATION_CARD_TITLE, cardOutput);
  }).catch(error => {
    winston.error(error.message);
    this.emit(':tell', messages.STANDINGS_REQUEST_ERROR);
  });

  winston.info('Ending getLotterySimulationHandler()');
};

const getTopNTankStandingsHandler = function () {
  winston.info('Starting getTopNTankStandingsHandler()');

  const numTeamsSlot = this.event.request.intent.slots.NumTeams;
  const numTeams = numTeamsSlot && numTeamsSlot.value ? numTeamsSlot.value : null;

  if (numTeams) {
    NBAClient.getStandingsRequest().then(standingsResponse => {
      const teams = _.slice(_resolveTrades(standingsResponse), 0, numTeams);
      const speechOutput = messages.getTankStandingsMessage(_addThe(teams));
      const cardOutput = messages.getTankStandingsText(_numericalOutput(teams));
      this.emit(':tellWithCard', speechOutput, messages.TANK_STANDINGS_CARD_TITLE, cardOutput);
    }).catch(error => {
      winston.error(error.message);
      this.emit(':tell', messages.STANDINGS_REQUEST_ERROR);
    });
  } else {
    winston.log(`Number not heard; Intent: ${JSON.stringify(this.event.request.intent)}`);
    this.emit(':ask', messages.NUMBER_NOT_HEARD, messages.NUMBER_NOT_HEARD);
  }

  winston.info('Ending getTopNTankStandingsHandler()');
};

const getTeamStandingsHandler = function () {
  winston.info('Starting getTeamStandingsHandler()');

  const teamSlot = this.event.request.intent.slots.Team;
  const teamName = teamSlot && teamSlot.value ? teamSlot.value : null;

  if (teamName) {
    NBAClient.getStandingsRequest().then(standingsResponse => {
      let foundIndices = [];
      let officialTeamNickname;

      _resolveTrades(standingsResponse).forEach((team, index) => {
        if (teamName.toLowerCase().includes(team.owner.toLowerCase()) ||
            team.owner.toLowerCase().includes(teamName.toLowerCase()) ||
            teamName.toLowerCase().includes('sixers') || teamName.toLowerCase().includes('seventy-sixers')) {
          officialTeamNickname = team.owner;
          foundIndices.push(index + 1);
        }
      });

      if (foundIndices.length) {
        const teamStandingsText = messages.getTeamStandingsMessage(officialTeamNickname, foundIndices);
        this.emit(':tellWithCard', teamStandingsText + ' ' + messages.CARD_ADDED,
            messages.getTankStandingsCardTitle(officialTeamNickname), teamStandingsText);
      } else {
        this.emit(':ask', messages.getTeamNotFoundError(teamName), messages.getTeamNotFoundError(teamName));
      }
    }).catch(error => {
      winston.error(error.message);
      this.emit(':tell', messages.STANDINGS_REQUEST_ERROR);
    });
  } else {
    winston.log(`Team not heard error; Intent: ${JSON.stringify(this.event.request.intent)}`);
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
