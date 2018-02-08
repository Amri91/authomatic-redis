/* eslint-disable camelcase */

/**
 * Data structures
 * refreshToken: {accessToken, userId}
 * userId: [refreshToken]
 */

'use strict';

const {promisify} = require('util');
const t = require('tcomb');

const UserId = t.String;
const RefreshToken = t.String;
const Token = t.String;
const TTL = t.Number;

const cbHandler = (resolve, reject) => (err, replies) => err ? reject(err) : resolve(replies);

module.exports = function Store({client, baseString = 'authomatic'}) {

  const getAsync = promisify(client.get).bind(client);
  const delAsync = promisify(client.del).bind(client);
  const smembersAsync = promisify(client.smembers).bind(client);
  const sremAsync = promisify(client.srem).bind(client);

  const getUKey = userId => `${baseString}_${userId}`;

  const getRTKey = refreshToken => `${baseString}_${refreshToken}`;

  /**
   * Register token and refresh token to the user
   * @param {String} userId
   * @param {String} refreshToken
   * @param {String} accessToken
   * @param {Number} ttl time to live in ms
   * @returns {Promise<Boolean>} returns true on success
   */
  const registerTokens = (userId, refreshToken, accessToken, ttl) => {
    RefreshToken(refreshToken);
    const stringifiedValue = JSON.stringify({uid: UserId(userId), at: Token(accessToken)});
    return new Promise((resolve, reject) => client
    .multi()
    // Sets refreshToken -> accessToken & userId
    .set(getRTKey(refreshToken), stringifiedValue, 'EX', TTL(ttl))
    // Adds refreshToken to userId set
    .sadd(getUKey(userId), refreshToken)
    .expire(getUKey(userId), TTL(ttl))
    .exec(cbHandler(resolve, reject)))
    .then(Boolean);
  };

  /**
   * Returns the access token associated with the refresh token
   * @param refreshToken
   * @returns {Promise<String|undefined>} the token or undefined if not found.
   */
  const getAccessToken = async refreshToken => {
    const value = await getAsync(getRTKey(RefreshToken(refreshToken)));
    if(value) {
      return JSON.parse(value).at;
    }
    return undefined;
  };

  /**
   * Remove a single refresh token from the user
   * @param refreshToken
   * @returns {Promise<Boolean>} true if found and remove, false otherwise
   */
  const remove = async refreshToken => {
    RefreshToken(refreshToken);
    const RTKey = getRTKey(refreshToken);
    const value = await getAsync(RTKey);
    const removeTPResult = await delAsync(RTKey);
    if(!value) {
      return false;
    }
    const userId = JSON.parse(value).uid;
    await sremAsync(userId, refreshToken);
    // Success based on the del command
    return Boolean(removeTPResult);
  };

  /**
   * Removes all tokens for a particular user
   * @param userId
   * @returns {Promise<Boolean>} true if any has been found and removed, false otherwise
   */
  const removeAll = async userId => {
    UserId(userId);
    const refreshTokens = await smembersAsync(getUKey(userId));
    // Refresh tokens might change during this operation,
    // but that is OK as far as this store is concerned.
    if (!refreshTokens.length) {
      return false;
    }

    return new Promise((resolve, reject) => client
    .multi()
    .del(refreshTokens.map(getRTKey))
    .srem(getUKey(userId), refreshTokens)
    .exec(cbHandler(resolve, reject)))
    // Success based on the first command (del)
    .then(replies => Boolean(replies[0]));
  };

  return {
    remove,
    removeAll,
    registerTokens,
    getAccessToken,
    client
  };
};
