'use strict';

module.exports = {
  DB_URL: process.env.MONGOHQ_URL || process.env.MONGOLAB_URI,
  PORT: process.env.PORT || 4000,
  ROOT_URL: 'http://shrt.com/',
  SENDGRID: '', //TODO: use process.env
  JWT_SECRET: process.env.JWT_SECRET || 'op89uvzx348zxvbhlqw' //TODO: change secret to env variable
}