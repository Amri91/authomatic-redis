/* eslint-disable camelcase */

'use strict';

const {promisify} = require('util');
const redisScan = require('redisscan');
const t = require('tcomb');

const UserId = t.String;
const RefreshToken = t.String;
const Token = t.String;
const TTL = t.Number;

class Store {
  constructor({client, baseString = 'authomatic'}) {
    this._client = client;
    this._setRedisMethods();
    this._baseString = baseString;
  }

  _getKeyPrefix(userId) {return `${this._baseString}_${userId}_`;}

  _getKey(userId, refreshToken) {return `${this._getKeyPrefix(userId)}${refreshToken}`;}

  /**
   * Register token and refresh token to the user
   * @param {String} userId
   * @param {String} refreshToken
   * @param {String} accessToken
   * @param {Number} ttl time to live in ms
   * @returns {Promise}
   */
  registerTokens(userId, refreshToken, accessToken, ttl) {
    return this.setAsync(
      this._getKey(
        UserId(userId),
        RefreshToken(refreshToken)
      ),
      Token(accessToken),
      'EX', TTL(ttl)
    );
  }

  /**
   * Checks if the refresh token is valid for this user
   * @param userId
   * @param refreshToken
   * @returns {Promise}
   */
  verify(userId, refreshToken) {
    return this.existsAsync(this._getKey(UserId(userId), RefreshToken(refreshToken)));
  }

  /**
   * Returns the user's token using the userId and the refresh token
   * @param userId
   * @param refreshToken
   * @returns {Promise}
   */
  getAccessToken(userId, refreshToken) {
    return this.getAsync(this._getKey(UserId(userId), RefreshToken(refreshToken)));
  }

  /**
   * Scans for redis keys
   * @param userId
   */
  _scanKeys(userId) {
    const set = new Set();
    const redis = this._client;
    const pattern = `${this._getKeyPrefix(userId)}*`;
    return new Promise((resolve, reject) => {
      redisScan({
        redis,
        pattern,
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
  }

  /**
   * Removes all tokens for a particular user
   * @param userId
   * @returns {Promise<[any, ...]>}
   */
  async removeAll(userId) {
    const keys = await this._scanKeys(UserId(userId));
    return keys.length && this.delAsync(keys);
  }

  /**
   * Remove a single refresh token from the user
   * @param userId
   * @param refreshToken
   * @returns {Promise}
   */
  remove(userId, refreshToken) {
    return this.delAsync(this._getKey(UserId(userId), RefreshToken(refreshToken)));
  }

  _setRedisMethods() {
    this.setAsync = promisify(this._client.set).bind(this._client);
    this.getAsync = promisify(this._client.get).bind(this._client);
    this.existsAsync = promisify(this._client.exists).bind(this._client);
    this.delAsync = promisify(this._client.del).bind(this._client);
  }
}

module.exports = Store;
