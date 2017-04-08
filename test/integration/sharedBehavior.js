const sharedBehavior = {
  shouldBehaveLikeTell: function (ssml) {
    it('should return outputSpeech matching string', function () {
      this.done.response.outputSpeech.ssml.should.have.string(ssml);
    });

    it('should not have a card', function () {
      this.done.response.should.not.have.keys('card');
    });

    it('should not have a reprompt', function () {
      this.done.response.should.not.have.keys('reprompt');
    });

    it('should end the session', function () {
      this.done.response.shouldEndSession.should.equal(true);
    });
  },

  shouldBehaveLikeTellWithCard: function (ssml, cardTitle, cardText) {
    it('should return outputSpeech matching string', function () {
      this.done.response.outputSpeech.ssml.should.have.string(ssml);
    });

    it('should have a card', function () {
      this.done.response.should.contain.keys('card');
    });

    it('should have a card title matching cardTitle', function () {
      this.done.response.card.title.should.equal(cardTitle);
    });

    it('should have card content matching cardText', function () {
      this.done.response.card.content.should.have.string(cardText);
    });

    it('should not have a reprompt', function () {
      this.done.response.should.not.have.keys('reprompt');
    });

    it('should end the session', function () {
      this.done.response.shouldEndSession.should.equal(true);
    });
  },

  shouldBehaveLikeAskWithReprompt: function (ssml, repromptSSML) {
    it('should return response outputSpeech matching string', function () {
      this.done.response.outputSpeech.ssml.should.have.string(ssml);
    });

    it('should return reprompt outputSpeech matching string', function () {
      this.done.response.reprompt.outputSpeech.ssml.should.have.string(repromptSSML);
    });

    it('should not have a card', function () {
      this.done.response.should.not.have.keys('card');
    });

    it('should not end the session', function () {
      this.done.response.shouldEndSession.should.equal(false);
    });
  }
};

module.exports = sharedBehavior;
