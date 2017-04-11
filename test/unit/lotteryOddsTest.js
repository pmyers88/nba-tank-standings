const chai = require('chai');
const lotteryOdds = require('../../src/lotteryOdds');

describe('lotteryOdds', function () {
  it('should only have keys 1, 2, 3', function () {
    lotteryOdds.should.have.keys('1', '2', '3');
  });

  it('the sum of the values for the first pick should be 1000', function () {
    lotteryOdds['1'].reduce((acc, val) => acc + val, 0).should.equal(1000);
  });

  it('the sum of the values for the second pick should be 999', function () {
    lotteryOdds['2'].reduce((acc, val) => acc + val, 0).should.equal(999);
  });

  it('the sum of the values for the third pick should be 1001', function () {
    lotteryOdds['3'].reduce((acc, val) => acc + val, 0).should.equal(1001);
  });
});

chai.should();
