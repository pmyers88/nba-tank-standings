const chai = require('chai');
const sinon = require('sinon');
const rewire = require('rewire');
const _ = require('lodash');

const lotteryOdds = rewire('../../src/lotteryOdds');

describe('LotteryOdds', function () {
  describe('#_lotteryOdds', function () {
    const _lotteryOdds = lotteryOdds.__get__('_lotteryOdds');

    it('should only have keys 1, 2, 3', function () {
      _lotteryOdds.should.have.keys('1', '2', '3');
    });

    it('the sum of the values for the first pick should be 1000', function () {
      _lotteryOdds['1'].reduce((acc, val) => acc + val, 0).should.equal(1000);
    });

    it('the sum of the values for the second pick should be 999', function () {
      _lotteryOdds['2'].reduce((acc, val) => acc + val, 0).should.equal(999);
    });

    it('the sum of the values for the third pick should be 1001', function () {
      _lotteryOdds['3'].reduce((acc, val) => acc + val, 0).should.equal(1001);
    });
  });

  describe('#selectWinnerForPick', function () {
    describe('with pickNum === 1', function () {
      let random;

      beforeEach(function () {
        random = sinon.stub(_, 'random');
      });

      afterEach(function () {
        _.random.restore();
      });

      it('should return 0 for 1 <= randomNum <= 250', function () {
        random.returns(1);
        lotteryOdds.selectWinnerForPick(1).should.equal(0);
        random.returns(51);
        lotteryOdds.selectWinnerForPick(1).should.equal(0);
        random.returns(250);
        lotteryOdds.selectWinnerForPick(1).should.equal(0);
      });

      it('should return 1 for 251 <= randomNum <= 449', function () {
        random.returns(251);
        lotteryOdds.selectWinnerForPick(1).should.equal(1);
        random.returns(300);
        lotteryOdds.selectWinnerForPick(1).should.equal(1);
        random.returns(449);
        lotteryOdds.selectWinnerForPick(1).should.equal(1);
      });

      it('should return 2 for 450 <= randomNum <= 605', function () {
        random.returns(450);
        lotteryOdds.selectWinnerForPick(1).should.equal(2);
        random.returns(500);
        lotteryOdds.selectWinnerForPick(1).should.equal(2);
        random.returns(605);
        lotteryOdds.selectWinnerForPick(1).should.equal(2);
      });

      it('should return 3 for 606 <= randomNum <= 724', function () {
        random.returns(606);
        lotteryOdds.selectWinnerForPick(1).should.equal(3);
        random.returns(700);
        lotteryOdds.selectWinnerForPick(1).should.equal(3);
        random.returns(724);
        lotteryOdds.selectWinnerForPick(1).should.equal(3);
      });

      it('should return 4 for 725 <= randomNum <= 812', function () {
        random.returns(725);
        lotteryOdds.selectWinnerForPick(1).should.equal(4);
        random.returns(800);
        lotteryOdds.selectWinnerForPick(1).should.equal(4);
        random.returns(812);
        lotteryOdds.selectWinnerForPick(1).should.equal(4);
      });

      it('should return 5 for 813 <= randomNum <= 875', function () {
        random.returns(813);
        lotteryOdds.selectWinnerForPick(1).should.equal(5);
        random.returns(850);
        lotteryOdds.selectWinnerForPick(1).should.equal(5);
        random.returns(875);
        lotteryOdds.selectWinnerForPick(1).should.equal(5);
      });

      it('should return 6 for 876 <= randomNum <= 918', function () {
        random.returns(876);
        lotteryOdds.selectWinnerForPick(1).should.equal(6);
        random.returns(900);
        lotteryOdds.selectWinnerForPick(1).should.equal(6);
        random.returns(918);
        lotteryOdds.selectWinnerForPick(1).should.equal(6);
      });

      it('should return 7 for 919 <= randomNum <= 946', function () {
        random.returns(919);
        lotteryOdds.selectWinnerForPick(1).should.equal(7);
        random.returns(930);
        lotteryOdds.selectWinnerForPick(1).should.equal(7);
        random.returns(946);
        lotteryOdds.selectWinnerForPick(1).should.equal(7);
      });

      it('should return 8 for 947 <= randomNum <= 963', function () {
        random.returns(947);
        lotteryOdds.selectWinnerForPick(1).should.equal(8);
        random.returns(955);
        lotteryOdds.selectWinnerForPick(1).should.equal(8);
        random.returns(963);
        lotteryOdds.selectWinnerForPick(1).should.equal(8);
      });

      it('should return 9 for 964 <= randomNum <= 974', function () {
        random.returns(964);
        lotteryOdds.selectWinnerForPick(1).should.equal(9);
        random.returns(970);
        lotteryOdds.selectWinnerForPick(1).should.equal(9);
        random.returns(974);
        lotteryOdds.selectWinnerForPick(1).should.equal(9);
      });

      it('should return 10 for 975 <= randomNum <= 982', function () {
        random.returns(975);
        lotteryOdds.selectWinnerForPick(1).should.equal(10);
        random.returns(980);
        lotteryOdds.selectWinnerForPick(1).should.equal(10);
        random.returns(982);
        lotteryOdds.selectWinnerForPick(1).should.equal(10);
      });

      it('should return 11 for 983 <= randomNum <= 989', function () {
        random.returns(983);
        lotteryOdds.selectWinnerForPick(1).should.equal(11);
        random.returns(986);
        lotteryOdds.selectWinnerForPick(1).should.equal(11);
        random.returns(989);
        lotteryOdds.selectWinnerForPick(1).should.equal(11);
      });

      it('should return 12 for 990 <= randomNum <= 995', function () {
        random.returns(990);
        lotteryOdds.selectWinnerForPick(1).should.equal(12);
        random.returns(992);
        lotteryOdds.selectWinnerForPick(1).should.equal(12);
        random.returns(995);
        lotteryOdds.selectWinnerForPick(1).should.equal(12);
      });

      it('should return 13 for 996 <= randomNum <= 1000', function () {
        random.returns(996);
        lotteryOdds.selectWinnerForPick(1).should.equal(13);
        random.returns(997);
        lotteryOdds.selectWinnerForPick(1).should.equal(13);
        random.returns(1000);
        lotteryOdds.selectWinnerForPick(1).should.equal(13);
      });
    });

    describe('with pickNum === 2 and alreadySelected === 0', function () {
      let random;

      beforeEach(function () {
        random = sinon.stub(_, 'random');
      });

      afterEach(function () {
        _.random.restore();
      });

      it('should not return 0', function () {
        random.onCall(0).returns(5);
        random.onCall(1).returns(200);
        random.onCall(2).returns(225);
        lotteryOdds.selectWinnerForPick(2, 0).should.equal(1);
      });
    });
  });
});
chai.should();
