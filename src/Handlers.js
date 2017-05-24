'use strict';

const winston = require('winston');
const _ = require('lodash');

const voiceId = process.argv[1].includes('mocha') ? 'test' : process.env.VOICE_LABS_ID;
const VoiceLabs = require('voicelabs')(voiceId);

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
  const intent = this.event.request.intent;

  if (this.event.request.type === events.LAUNCH_REQUEST) {
    VoiceLabs.track(this.event.session, events.LAUNCH_REQUEST, _.get(intent, 'slots'), null, (error, response) => {   // eslint-disable-line
      this.emit(events.LAUNCH_REQUEST);
    });
  } else if (this.event.request.type === events.SESSION_ENDED) {
    VoiceLabs.track(this.event.session, events.SESSION_ENDED, _.get(intent, 'slots'), null, (error, response) => {   // eslint-disable-line
      this.emit(events.SESSION_ENDED);
    });
  } else if (this.event.request.type === 'IntentRequest') {
    this.emit(this.event.request.intent.name);
  }
};

const launchRequestHandler = function () {
  const intent = this.event.request.intent;

  const speechText = messages.WELCOME_MESSAGE;
  VoiceLabs.track(this.event.session, events.LAUNCH_REQUEST, _.get(intent, 'slots'), speechText, (error, response) => {   // eslint-disable-line
    this.emit(':ask', speechText, messages.WELCOME_REPROMPT);
  });
};

const getTankStandingsHandler = function () {
  const intent = this.event.request.intent;

  const NBAClient = NBAClientFactory.getNBAClient();
  NBAClient.getStandingsRequest().then(standingsResponse => {
    const teams = _resolveTrades(standingsResponse);
    const speechOutput = messages.getTankStandingsMessage(_addThe(_.slice(teams, 0, NUM_TEAMS))) + ' ' +
        messages.FULL_STANDINGS_CARD_ADDED;
    const cardOutput = messages.getTankStandingsText(_numericalOutput(_.slice(teams, 0, NUM_LOTTERY_TEAMS)));

    VoiceLabs.track(this.event.session, intent.name, _.get(intent, 'slots'), speechOutput, (error, response) => {   // eslint-disable-line
      this.emit(':tellWithCard', speechOutput, messages.TANK_STANDINGS_CARD_TITLE, cardOutput);
    });
  }).catch(error => {
    winston.error(error.message);
    const speechText = messages.STANDINGS_REQUEST_ERROR;
    VoiceLabs.track(this.event.session, intent.name, _.get(intent, 'slots'), speechText, (error, response) => {   // eslint-disable-line
      this.emit(':tell', speechText);
    });
  });
};

const getLotterySimulationHandler = function () {
  const intent = this.event.request.intent;

  if (DRAFT_ORDER_SET === 'true') {
    const speechOutput = messages.DRAFT_ORDER_SET_MESSAGE;
    VoiceLabs.track(this.event.session, intent.name, _.get(intent, 'slots'), speechOutput, (error, response) => {   // eslint-disable-line
      this.emit(':tell', speechOutput);
    });
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
      VoiceLabs.track(this.event.session, intent.name, _.get(intent, 'slots'), speechOutput, (error, response) => {   // eslint-disable-line
        this.emit(':tellWithCard', speechOutput, messages.LOTTERY_SIMULATION_CARD_TITLE, cardOutput);
      });
    }).catch(error => {
      winston.error(error.message);
      const speechText = messages.STANDINGS_REQUEST_ERROR;
      VoiceLabs.track(this.event.session, intent.name, _.get(intent, 'slots'), speechText, (error, response) => {   // eslint-disable-line
        this.emit(':tell', speechText);
      });
    });
  }
};

const getTopNTankStandingsHandler = function () {
  const intent = this.event.request.intent;

  const NBAClient = NBAClientFactory.getNBAClient();
  const numTeamsSlot = this.event.request.intent.slots.NumTeams;
  const numTeams = numTeamsSlot && numTeamsSlot.value ? numTeamsSlot.value : null;

  if (numTeams) {
    NBAClient.getStandingsRequest().then(standingsResponse => {
      const teams = _.slice(_resolveTrades(standingsResponse), 0, numTeams);
      const speechOutput = messages.getTankStandingsMessage(_addThe(teams)) + ' ' +
          messages.CARD_ADDED;
      const cardOutput = messages.getTankStandingsText(_numericalOutput(teams));
      VoiceLabs.track(this.event.session, intent.name, _.get(intent, 'slots'), speechOutput, (error, response) => {   // eslint-disable-line
        this.emit(':tellWithCard', speechOutput, messages.TANK_STANDINGS_CARD_TITLE, cardOutput);
      });
    }).catch(error => {
      winston.error(error.message);
      const speechText = messages.STANDINGS_REQUEST_ERROR;
      VoiceLabs.track(this.event.session, intent.name, _.get(intent, 'slots'), speechText, (error, response) => {   // eslint-disable-line
        this.emit(':tell', speechText);
      });
    });
  } else {
    winston.log(`Number not heard; Intent: ${JSON.stringify(this.event.request.intent)}`);
    const speechText = messages.NUMBER_NOT_HEARD;
    VoiceLabs.track(this.event.session, intent.name, _.get(intent, 'slots'), speechText, (error, response) => {   // eslint-disable-line
      this.emit(':ask', speechText, messages.NUMBER_NOT_HEARD);
    });
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
        VoiceLabs.track(this.event.session, intent.name, _.get(intent, 'slots'), speechOutput, (error, response) => {   // eslint-disable-line
          this.emit(':tellWithCard', speechOutput, messages.getTankStandingsCardTitle(officialTeamNickname),
              teamStandingsText);
        });
      } else {
        const speechText = messages.getTeamNotFoundError(teamName);
        VoiceLabs.track(this.event.session, intent.name, _.get(intent, 'slots'), speechText, (error, response) => {   // eslint-disable-line
          this.emit(':ask', speechText, messages.getTeamNotFoundError(teamName));
        });
      }
    }).catch(error => {
      winston.error(error.message);
      const speechText = messages.STANDINGS_REQUEST_ERROR;
      VoiceLabs.track(this.event.session, intent.name, _.get(intent, 'slots'), speechText, (error, response) => {   // eslint-disable-line
        this.emit(':tell', speechText);
      });
    });
  } else {
    winston.log(`Team not heard error; Intent: ${JSON.stringify(this.event.request.intent)}`);
    const speechText = messages.TEAM_NOT_HEARD_ERROR;
    VoiceLabs.track(this.event.session, intent.name, _.get(intent, 'slots'), speechText, (error, response) => {   // eslint-disable-line
      this.emit(':ask', speechText, messages.TEAM_NOT_HEARD_ERROR);
    });
  }
};

const amazonHelpHandler = function () {
  const intent = this.event.request.intent;

  const speechText = messages.HELP_MESSAGE;
  VoiceLabs.track(this.event.session, intent.name, _.get(intent, 'slots'), speechText, (error, response) => {   // eslint-disable-line
    this.emit(':ask', speechText, messages.HELP_MESSAGE);
  });
};

const amazonCancelHandler = function () {
  this.emit(events.SESSION_ENDED);
};

const amazonStopHandler = function () {
  this.emit(events.SESSION_ENDED);
};

const sessionEndedRequestHandler = function () {
  const intent = this.event.request.intent;

  const speechText = messages.STOP_MESSAGE;
  VoiceLabs.track(this.event.session, _.get(intent, 'name', events.SESSION_ENDED), _.get(intent, 'slots'), speechText, (error, response) => {   // eslint-disable-line
    this.emit(':tell', speechText);
  });
};

const unhandledRequestHandler = function () {
  const intent = this.event.request.intent;

  const speechText = messages.UNHANDLED_MESSAGE;
  VoiceLabs.track(this.event.session, events.UNHANDLED, _.get(intent, 'slots'), speechText, (error, response) => {   // eslint-disable-line
    this.emit(':ask', speechText, messages.HELP_MESSAGE);
  });
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
