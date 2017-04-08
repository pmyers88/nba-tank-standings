const intentRequest = {
  getRequest: function (intent, type) {
    return {
      session: {
        sessionId: 'SessionId.UUID',
        application: {
          applicationId: 'amzn1.ask.skill.UUID'
        },
        attributes: {},
        user: {
          userId: 'amzn1.ask.account.account_num'
        },
        new: true
      },
      request: {
        type: type || 'IntentRequest',
        requestId: 'EdwRequestId.UUID',
        locale: 'en-US',
        timestamp: '2017-04-06T21:19:13Z',
        intent: intent
      },
      version: '1.0'
    };
  }
};

module.exports = intentRequest;
