/* eslint-disable camelcase */

'use strict';

const {promisify} = require('util');
const redisScan = require('redisscan');
const t = require('tcomb');

const RefreshTokenJTI = t.String;
const AccessTokenJTI = t.String;
const TTL = t.Number;

module.exports = function Store({client, baseString = 'authomatic'}) {

  const UserId = userId => {
    t.String(userId);
    if(userId.includes(baseString)) {
      throw new Error(`User id: ${userId} should not contain the base string _${baseString}_.
      Change the base string or the userId`);
    }
    return userId;
  };

  const setAsync = promisify(client.set).bind(client);
  const delAsync = promisify(client.del).bind(client);

  const getKeyPrefix = userId => `${userId}_${baseString}_`;

  const getKey = (userId, refreshToken) => `${getKeyPrefix(userId)}${refreshToken}`;

  /**
   * Register token and refresh token to the user
   * @param {String} userId
   * @param {String} refreshTokenJTI
   * @param {String} accessTokenJTI
   * @param {Number} ttl time to live in ms
   * @returns {Promise<Boolean>} returns true when created.
   */
  const add = (userId, refreshTokenJTI, accessTokenJTI, ttl) => setAsync(
    getKey(
      UserId(userId),
      RefreshTokenJTI(refreshTokenJTI)
    ),
    // Not used yet, might be used later.
    AccessTokenJTI(accessTokenJTI),
    'EX', TTL(ttl)
  ).then(Boolean);

  /**
   * Scans for redis keys
   * @param userId
   */
  const scanKeys = userId => {
    const set = new Set();
    return new Promise((resolve, reject) => {
      redisScan({
        redis: client,
        pattern: `${getKeyPrefix(userId)}*`,
        keys_only: true,
        each_callback: function (type, key, subkey, length, value, cb) {
          set.add(key);
          cb();
        },
        done_callback: function (err) {
          if(err) {return reject(err);}
          return resolve([...set]);
        }
      });
    });
  };

  /**
   * Remove a single refresh token from the user
   * @param userId
   * @param refreshTokenJTI
   * @returns {Promise<Boolean>} true if found and deleted, otherwise false.
   */
  const remove = (userId, refreshTokenJTI) =>
    delAsync(getKey(UserId(userId), RefreshTokenJTI(refreshTokenJTI))).then(Boolean);

  /**
   * Removes all tokens for a particular user
   * @param userId
   * @returns {Promise<Boolean>} true if any were found and delete, false otherwise
   */
  const removeAll = async userId => {
    const keys = await scanKeys(UserId(userId));
    return Boolean(keys.length && await delAsync(keys));
  };

  return {
    remove,
    removeAll,
    add,
    client
  };
};
