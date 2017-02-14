'use strict';

module.exports = {
  DB_URL: process.env.MONGOLAB_URI || 'mongodb://' + (process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost') + '/tinyapp-local',
  // DB_URL: process.env.MONGOLAB_URI || 'mongodb://' + (process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost') + '/tinyapp-production',
  PORT: process.env.PORT || 4000,
  ROOT_URL: 'http://localhost:' + (process.env.PORT || 4000),
  SENDGRID: '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',
  JWT_SECRET: 'op89uvzx348zxvbhlqw'
}