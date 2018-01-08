'use strict';

const Store = require('./store');
const redis = require('redis');

module.exports = options => new Store({
  ...options,
  client: redis.createClient(options.redisOptions)
});
