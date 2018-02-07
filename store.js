/* eslint-disable camelcase */

'use strict';

const {promisify} = require('util');
const redisScan = require('redisscan');
const t = require('tcomb');

const UserId = t.String;
const RefreshToken = t.String;
const Token = t.String;
const TTL = t.Number;

module.exports = function Store({client, baseString = 'authomatic'}) {

  const setAsync = promisify(client.set).bind(client);
  const getAsync = promisify(client.get).bind(client);
  const existsAsync = promisify(client.exists).bind(client);
  const delAsync = promisify(client.del).bind(client);

  const getKeyPrefix = userId => `${baseString}_${userId}_`;

  const getKey = (userId, refreshToken) => `${getKeyPrefix(userId)}${refreshToken}`;

  /**
   * Register token and refresh token to the user
   * @param {String} userId
   * @param {String} refreshToken
   * @param {String} accessToken
   * @param {Number} ttl time to live in ms
   * @returns {Promise}
   */
  const registerTokens = (userId, refreshToken, accessToken, ttl) => setAsync(
    getKey(
      UserId(userId),
      RefreshToken(refreshToken)
    ),
    Token(accessToken),
    'EX', TTL(ttl)
  );

  /**
   * Checks if the refresh token is valid for this user
   * @param userId
   * @param refreshToken
   * @returns {Promise}
   */
  const verify = (userId, refreshToken) =>
    existsAsync(getKey(UserId(userId), RefreshToken(refreshToken)));

  /**
   * Returns the user's token using the userId and the refresh token
   * @param userId
   * @param refreshToken
   * @returns {Promise}
   */
  const getAccessToken = (userId, refreshToken) =>
    getAsync(getKey(UserId(userId), RefreshToken(refreshToken)));

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
        keys_only: false,
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
   * Removes all tokens for a particular user
   * @param userId
   * @returns {Promise<[any, ...]>}
   */
  const removeAll = async userId => {
    const keys = await scanKeys(UserId(userId));
    return keys.length && delAsync(keys);
  };

  /**
   * Remove a single refresh token from the user
   * @param userId
   * @param refreshToken
   * @returns {Promise}
   */
  const remove = (userId, refreshToken) =>
    delAsync(getKey(UserId(userId), RefreshToken(refreshToken)));

  return {
    remove,
    removeAll,
    registerTokens,
    getAccessToken,
    verify,
    client
  };
};
