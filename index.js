'use strict';

require('dotenv').config();

const NBATankRankingsSkill = require('./src/NBATankRankingsSkill');

exports.handler = NBATankRankingsSkill.handler;
