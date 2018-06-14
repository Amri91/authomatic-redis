'use strict';

const Store = require('./store');
const redis = require('redis');

/**
 * Creates a store object.
 * @param {Object} [options]
 * @param {Object} [options.redisOptions] options to be passed directly to 'redis'
 * if you do not pass a redis client.
 * @param {Object} [options.client] redis client provided by the user.
 * @return {{remove, removeAll, add}}
 */
module.exports = ({redisOptions, client, ...options} = {}) =>
  Store({options, client: client || redis.createClient(redisOptions)});
