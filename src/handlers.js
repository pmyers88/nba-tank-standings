'use strict';

const winston = require('winston');
const _ = require('lodash');

const NBAClientFactory = require('./NBAClientFactory');
const teams = require('../resources/teams');
const messages = require('./messages');
const intents = require('./intents');
const events = require('./events');
const lotteryOdds = require('./lotteryOdds');

const NUM_TEAMS = process.env.NUM_TEAMS;
const DRAFT_ORDER_SET = process.env.DRAFT_ORDER_SET;
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
  return teams.map(team => `the ${team.owner}` + (team.owner === team.from ? '' : `, from the ${team.from}`));
};

const _numericalOutput = (teams) => {
  return teams.map((team, index) => `${index + 1}. ${team.owner}` + (team.owner === team.from ? '' : ` (from the ${team.from})`));
};

const newSessionRequestHandler = function () {
  if (this.event.request.type === events.LAUNCH_REQUEST) {
    this.emit(events.LAUNCH_REQUEST);
  } else if (this.event.request.type === events.SESSION_ENDED) {
    this.emit(events.SESSION_ENDED);
  } else if (this.event.request.type === 'IntentRequest') {
    this.emit(this.event.request.intent.name);
  }
};

const launchRequestHandler = function () {
  this.emit(':ask', messages.WELCOME_MESSAGE, messages.WELCOME_REPROMPT);
};

const getTankStandingsHandler = function () {
  const NBAClient = NBAClientFactory.getNBAClient();
  NBAClient.getStandingsRequest().then(standingsResponse => {
    const teams = _resolveTrades(standingsResponse);
    const speechOutput = messages.getTankStandingsMessage(_addThe(_.slice(teams, 0, NUM_TEAMS))) + ' ' +
        messages.FULL_STANDINGS_CARD_ADDED;
    const cardOutput = messages.getTankStandingsText(_numericalOutput(_.slice(teams, 0, NUM_LOTTERY_TEAMS)));

    this.emit(':tellWithCard', speechOutput, messages.TANK_STANDINGS_CARD_TITLE, cardOutput);
  }).catch(error => {
    winston.error(error.message);
    this.emit(':tell', messages.STANDINGS_REQUEST_ERROR);
  });
};

const getLotterySimulationHandler = function () {
  if (DRAFT_ORDER_SET === 'true') {
    const speechOutput = messages.DRAFT_ORDER_SET_MESSAGE;
    this.emit(':tell', speechOutput);
  } else {
    const NBAClient = NBAClientFactory.getNBAClient();
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
  }
};

const getTopNTankStandingsHandler = function () {
  const NBAClient = NBAClientFactory.getNBAClient();
  const numTeamsSlot = this.event.request.intent.slots.NumTeams;
  const numTeams = numTeamsSlot && numTeamsSlot.value ? numTeamsSlot.value : null;

  if (numTeams) {
    NBAClient.getStandingsRequest().then(standingsResponse => {
      const teams = _.slice(_resolveTrades(standingsResponse), 0, numTeams);
      const speechOutput = messages.getTankStandingsMessage(_addThe(teams)) + ' ' +
          messages.CARD_ADDED;
      const cardOutput = messages.getTankStandingsText(_numericalOutput(teams));
      this.emit(':tellWithCard', speechOutput, messages.TANK_STANDINGS_CARD_TITLE, cardOutput);
    }).catch(error => {
      winston.error(error.message);
      this.emit(':tell', messages.STANDINGS_REQUEST_ERROR);
    });
  } else {
    winston.log(`Number not heard; Intent: ${JSON.stringify(this.event.request.intent)}`);
    const speechText = messages.NUMBER_NOT_HEARD;
    this.emit(':ask', speechText, messages.NUMBER_NOT_HEARD);
  }
};

const getTeamStandingsHandler = function () {
  const intent = this.event.request.intent;

  const NBAClient = NBAClientFactory.getNBAClient();
  const teamSlot = intent.slots.Team;
  let teamName = teamSlot && teamSlot.value ? teamSlot.value : null;

  if (teamName) {
    NBAClient.getStandingsRequest().then(standingsResponse => {
      let foundIndices = [];
      let officialTeamNickname;

      // handle other sixers nicknames
      if (teamName.toLowerCase().includes('sixers') || teamName.toLowerCase().includes('seventy-sixers')) {
        teamName = '76ers';
      }

      _resolveTrades(standingsResponse).forEach((team, index) => {
        if (teamName.toLowerCase().split(' ').includes(team.owner.toLowerCase())) {
          officialTeamNickname = team.owner;
          foundIndices.push(index + 1);
        } else if (teamName.toLowerCase().startsWith(team.from.toLowerCase()) ||
            team.from.toLowerCase().startsWith(teamName.toLowerCase())) {
          officialTeamNickname = team.from;
        }
      });

      if (officialTeamNickname) {
        const teamStandingsText = messages.getTeamStandingsMessage(officialTeamNickname, foundIndices);
        const speechOutput = teamStandingsText + ' ' + messages.CARD_ADDED;
        this.emit(':tellWithCard', speechOutput, messages.getTankStandingsCardTitle(officialTeamNickname),
            teamStandingsText);
      } else {
        this.emit(':ask', messages.getTeamNotFoundError(teamName), messages.getTeamNotFoundError(teamName));
      }
    }).catch(error => {
      winston.error(error.message);
      const speechText = messages.STANDINGS_REQUEST_ERROR;
      this.emit(':tell', speechText);
    });
  } else {
    winston.log(`Team not heard error; Intent: ${JSON.stringify(this.event.request.intent)}`);
    this.emit(':ask', messages.TEAM_NOT_HEARD_ERROR, messages.TEAM_NOT_HEARD_ERROR);
  }
};

const amazonHelpHandler = function () {
  this.emit(':ask', messages.HELP_MESSAGE, messages.HELP_MESSAGE);
};

const amazonCancelHandler = function () {
  this.emit(events.SESSION_ENDED);
};

const amazonStopHandler = function () {
  this.emit(events.SESSION_ENDED);
};

const sessionEndedRequestHandler = function () {
  this.emit(':tell', messages.STOP_MESSAGE);
};

const unhandledRequestHandler = function () {
  this.emit(':ask', messages.UNHANDLED_MESSAGE, messages.HELP_MESSAGE);
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
