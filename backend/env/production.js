'use strict';

module.exports = {
  DB_URL: process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://' + (process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost') + '/tinyapp-prod',
  PORT: process.env.PORT || 80,
  ROOT_URL: 'https://app.tinyapp.biz',
  JWT_SECRET: process.env.JWT_SECRET || 'op89uvzx348zxvbhlqw' //TODO: change secret to env variable
}