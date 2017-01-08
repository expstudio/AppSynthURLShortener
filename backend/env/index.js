'use strict';

var config = require('./' + (process.env.NODE_ENV || 'development') + '.js');

module.exports = config;