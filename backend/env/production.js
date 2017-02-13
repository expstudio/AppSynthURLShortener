'use strict';

module.exports = {
  DB_URL: process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://' + (process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost') + '/tiny-app',
  PORT: process.env.PORT || 4000,
  ROOT_URL: 'https://api.tinyapp.biz',
  SENDGRID: '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', //TODO: use process.env
  JWT_SECRET: process.env.JWT_SECRET || 'op89uvzx348zxvbhlqw' //TODO: change secret to env variable
}