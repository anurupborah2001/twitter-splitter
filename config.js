/**
 * Twitter Splitter Configuration Script
 * @category  Twitter Splitter Configration
 * @author Anurup Borah<anurupborah2001@gmail.com>
 * @version 1.0
 */
require('dotenv').config({path: 'config.env'});
var config = {
  REDISURL: getEnv('REDISURL'),
  PORT: getEnv('PORT'),
  HOST: getEnv('HOST')
};

/*
* Function to get the Environment Variable
*/
function getEnv(variable){
  if (process.env[variable] === undefined){
    throw new Error('You must create an environment variable for ' + variable);
  }
    return process.env[variable];
};

module.exports = config;