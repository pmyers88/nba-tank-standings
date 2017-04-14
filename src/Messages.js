'use strict';

const compoundSubject = require('compound-subject');
const inflection = require('inflection');
const {inflect, ordinalize} = inflection;

const HELP_MESSAGE = 'Try asking, what are the tank standings, tell me the top 5 teams, what is the Sixers record, or ' +
    'simulate the lottery. Now, what can I help you with?';
const CARD_ADDED = 'A card with this information has been added to your Alexa app.';

const messages = {
  CARD_ADDED: CARD_ADDED,
  FULL_STANDINGS_CARD_ADDED: 'A card with the full lottery standings has been added to your Alexa app.',
  HELP_MESSAGE: HELP_MESSAGE,
  LOTTERY_SIMULATION_CARD_TITLE: 'Lottery Simulation Standings',
  NUMBER_NOT_HEARD: 'I couldn\'t hear the number of teams you asked for. Please repeat your request.',
  STANDINGS_REQUEST_ERROR: 'There was an error trying to fetch the latest NBA standings. Please try again later.',
  STOP_MESSAGE: 'Ok, goodbye!',
  TANK_STANDINGS_CARD_TITLE: 'NBA Tank Standings',
  TEAM_NOT_HEARD_ERROR: 'I couldn\'t find the team you asked about. Please repeat your request.',
  UNHANDLED_MESSAGE: 'Sorry, I don\'t know how to handle that request. ' + HELP_MESSAGE,
  WELCOME_MESSAGE: 'Welcome to NBA Tank Standings, the app for finding out the latest info about the NBA draft lottery. ' +
      HELP_MESSAGE,
  WELCOME_REPROMPT: 'For instructions on what you can say, please say help me.',
  getLotterySimulationMessage: (draftOrder) => {
    return `After simulating the lottery, the new draft order is ${compoundSubject(draftOrder).delimitAll().make()}. ` +
        CARD_ADDED;
  },
  getLotterySimulationText: (draftOrder) => {
    return `After simulating the lottery, the new draft order is:\n${draftOrder.join('\n')}`;
  },
  getTankStandingsMessage: (teams) => {
    return `The top${teams.length > 1 ? ' ' + teams.length : ''} ${inflect('team', teams.length)} in the tank ` +
        `standings ${inflect('is', teams.length, 'is', 'are')} ${compoundSubject(teams).delimitAll().make()}.`;
  },
  getTankStandingsText: (teams) => {
    return `The top${teams.length > 1 ? ' ' + teams.length : ''} ${inflect('team', teams.length)} in the tank ` +
        `standings ${inflect('is', teams.length, 'is', 'are')}:\n${teams.join('\n')}`;
  },
  getTankStandingsCardTitle: (team) => {
    return `${team} Tank Standings`;
  },
  getTeamNotFoundError: (team) => {
    return `Sorry, I could not find a team named ${team}. Please ask again.`;
  },
  getTeamStandingsMessage: (team, picks) => {
    let message = `The ${team} currently don't hold any draft picks in the first round.`;
    if (picks.length > 0) {
      message = `The ${team} currently hold the ` + compoundSubject(picks.map(pick => {
        return ordinalize(pick.toString());
      })).delimitAll().make() + ` ${inflect('spot', picks.length)} in the NBA tank standings.`;
    }
    return message;
  }
};

module.exports = messages;
