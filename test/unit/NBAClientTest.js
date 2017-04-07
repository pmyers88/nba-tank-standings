const chai = require('chai');
const sinon = require('sinon');
const PassThrough = require('stream').PassThrough;
const http = require('http');

const NBAClient = require('../../src/NBAClient');
const standings = require('../fixtures/standings_conference');

chai.should();

describe('NBAClient', function () {
  let nbaClient;
  const endpoint = 'data.nba.net';
  const standingsPath = '/data/10s/prod/v1/current/standings_conference.json';

  beforeEach(function () {
    nbaClient = new NBAClient();
  });

  describe('#constructor', function () {
    it('should create an NBAClient with the correct defaults', function () {
      const client = new NBAClient();
      client._endpoint.should.equal(endpoint);
    });
  });

  describe('#getStandingsRequest', function () {
    let handleRequest;

    beforeEach(function () {
      handleRequest = sinon.stub(nbaClient, '_handleRequest');
    });

    afterEach(function () {
      nbaClient._handleRequest.restore();
    });

    it('should return JSON objects for 30 teams', function () {
      const expected = {statusCode: 200, json: standings};
      handleRequest.callsArgWith(1, expected);

      const standingsRequest = nbaClient.getStandingsRequest();
      return standingsRequest.then(nbaStandings => {
        nbaStandings.length.should.equal(30);
      });
    });

    it('each team should have a teamId', function () {
      const expected = {statusCode: 200, json: standings};
      handleRequest.callsArgWith(1, expected);

      const standingsRequest = nbaClient.getStandingsRequest();
      return standingsRequest.then(nbaStandings => {
        nbaStandings.forEach(team => {
          team.should.include.keys('teamId');
        });
      });
    });

    it('should return NBA teams sorted by winning percentage', function () {
      const expected = {statusCode: 200, json: standings};
      handleRequest.callsArgWith(1, expected);

      const standingsRequest = nbaClient.getStandingsRequest();
      return standingsRequest.then(nbaStandings => {
        let winPct = '.000';
        nbaStandings.forEach(team => {
          winPct.should.be.at.most(team.winPct);
          winPct = team.winPct;
        });
      });
    });

    it('should reject when status code is in the 400 range', function () {
      const expected = {statusCode: 400, json: {}};
      handleRequest.callsArgWith(1, expected);

      const standingsRequest = nbaClient.getStandingsRequest();
      return standingsRequest.catch(error => {
        error.message.should.equal(`Received invalid HTTP response code: 400`);
      });
    });

    it('should reject the promise on request error', function () {
      const message = 'there was an error with your request';
      const expected = new Error('there was an error with your request');

      handleRequest.callsArgWith(2, expected);

      const standingsRequest = nbaClient.getStandingsRequest();

      return standingsRequest.catch(error => {
        error.message.should.equal(message);
      });
    });
  });

  describe('#_handleRequest', function () {
    let get;

    beforeEach(function () {
      get = sinon.stub(http, 'get');
    });

    afterEach(function () {
      http.get.restore();
    });

    it('should resolve the promise with an nbaStandingsResponse on end', function (done) {
      const expected = {foo: 'bar', baz: 'foobar', num: 1};
      const response = new PassThrough();
      response.statusCode = 200;
      response.write(JSON.stringify(expected));
      response.end();

      const request = new PassThrough();
      get.callsArgWith(1, response).returns(request);

      nbaClient._handleRequest({hostname: endpoint, path: standingsPath}, result => {
        result.statusCode.should.equal(200);
        result.json.should.eql(expected);
        done();
      });
    });

    it('should reject the promise on error', function (done) {
      const expected = 'there was an error with your request';
      const request = new PassThrough();

      get.returns(request);

      nbaClient._handleRequest({}, () => {}, error => {
        error.should.equal(expected);
        done();
      });

      request.emit('error', expected);
    });
  });

  describe('#_getRequestOptions', function () {
    it('should return the correct request options', function () {
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_1) AppleWebKit/537.36 (KHTML, like Gecko) ' +
        'Chrome/56.0.2924.87 Safari/537.36',
        'Accept': 'application/json'
      };

      let options = nbaClient._getRequestOptions(standingsPath);
      options.should.eql({
        hostname: endpoint,
        path: '/data/10s/prod/v1/current/standings_conference.json',
        headers: headers
      });
      options = nbaClient._getRequestOptions('/foo.json');
      options.should.eql({
        hostname: endpoint,
        path: '/foo.json',
        headers: headers
      });
    });
  });
});
