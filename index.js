'use strict';

require('dotenv').config();

const NBATankStandingsSkill = require('./src/NBATankStandingsSkill');

exports.handler = NBATankStandingsSkill.handler;
