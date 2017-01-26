'use strict';

module.exports = {
  DB_URL: process.env.MONGOLAB_URI || 'mongodb://' + (process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost') + '/tiny-app',
  // DB_URL: process.env.MONGOLAB_URI || 'mongodb://' + (process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost') + '/tinyapp-production',
  PORT: process.env.PORT || 4000,
  ROOT_URL: 'http://localhost:' + (process.env.PORT || 4000),
  JWT_SECRET: 'op89uvzx348zxvbhlqw'
}