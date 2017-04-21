'use strict';

const _ = require('lodash');

// source for odds: https://en.wikipedia.org/wiki/NBA_draft_lottery
const _lotteryOdds = {
  1: [250, 199, 156, 119, 88, 63, 43, 28, 17, 11, 8, 7, 6, 5],
  2: [215, 188, 157, 126, 97, 71, 49, 33, 20, 13, 9, 8, 7, 6],
  3: [178, 171, 156, 133, 107, 81, 58, 39, 24, 16, 12, 10, 9, 7]
};

const selectWinnerForPick = (pickNum, alreadySelected) => {
  const weightedArray = _lotteryOdds[pickNum];
  const sumChancesForPick = weightedArray.reduce((acc, num) => acc + num, 0);
  let winnerIndex;
  do {
    const randomNum = _.random(1, sumChancesForPick);
    let sum = 0;
    // team 0 has 250 chances, so random drawing between 1 and 250 == team0
    // team 1 has 199 chances, so random drawing between 251 and 459 == team1
    // etc.
    winnerIndex = _.findIndex(weightedArray, (val) => {
      sum += val;
      return randomNum <= sum;
    });
  } while (_.findIndex(alreadySelected, num => winnerIndex === num) !== -1);
  return winnerIndex;
};

module.exports = {
  selectWinnerForPick: selectWinnerForPick
};
