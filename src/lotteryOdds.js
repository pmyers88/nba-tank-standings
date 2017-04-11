const _ = require('lodash');

const _lotteryOdds = {
  1: [250, 199, 156, 119, 88, 63, 43, 28, 17, 11, 8, 7, 6, 5],
  2: [215, 188, 157, 126, 97, 71, 49, 33, 20, 13, 9, 8, 7, 6],
  3: [178, 171, 156, 133, 107, 81, 58, 39, 24, 16, 12, 10, 9, 7]
};

const selectWinnerForPick = (pickNum) => {
  const weightedArray = _lotteryOdds[pickNum];
  const total = weightedArray.reduce((acc, num) => acc + num, 0);
  const randomNum = _.random(1, total);
  let sum = 0;
  return _.findIndex(weightedArray, (val) => {
    sum += val;
    return randomNum <= sum;
  });
};

module.exports = {
  selectWinnerForPick: selectWinnerForPick
};
