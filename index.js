'use strict';

const Store = require('./store');
const redis = require('redis');

/**
 * Creates a store object
 * @param {Object} [options]
 * @param {Object} options.redisOptions options to be passed directly to 'redis'
 * @return {{remove, removeAll, registerTokens, getAccessToken, verify, client}}
 */
module.exports = ({redisOptions, ...options} = {}) =>
  Store({options, client: redis.createClient(redisOptions)});
