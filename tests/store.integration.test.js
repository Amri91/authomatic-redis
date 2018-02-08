'use strict';

const redis = require('redis');
const Store = require('../store');

describe('RedisStore', () => {
  let store, client;
  const userId = 'userId', refreshToken = 'refreshToken', accessToken = 'accessToken', ttl = 60000;

  beforeEach(() => {
    client = redis.createClient();
    store = new Store({client, test: true});
  });
  afterEach(done => {
    client.flushall(e => {
      client.quit();
      done(e);
    });
  });

  describe('#registerTokens', () => {
    it('Should store access and refresh tokens', async () => {
      expect(await store.registerTokens(userId, refreshToken, accessToken, ttl)).toBe(true);
    });
  });

  describe('#getAccessToken', () => {
    it('Should retrieve correct token', async () => {
      await store.registerTokens(userId, 'r1', '1', ttl);
      await store.registerTokens(userId, refreshToken, accessToken, ttl);
      await store.registerTokens(userId, 'r3', '3', ttl);
      expect(await store.getAccessToken(refreshToken)).toBe(accessToken);
    });
    it('should return nothing if token was not found', async () => {
      expect(await store.getAccessToken(refreshToken)).toBe(undefined);
    });
  });

  describe('#remove', () => {
    it('Should return true if record is removed', async () => {
      await store.registerTokens(userId, refreshToken, accessToken, ttl);
      expect(await store.remove(refreshToken)).toBe(true);
      expect(await store.remove(refreshToken)).toBe(false);
    });
    it('Should return false if record does not exist', async () => {
      expect(await store.remove(refreshToken)).toBe(false);
    });
  });

  describe('#removeAll', () => {
    it('Should remove all refresh tokens for a single user', async () => {
      await store.registerTokens(userId, refreshToken, accessToken, ttl);
      await store.registerTokens(userId, 'r1', 'a1', ttl);
      await store.registerTokens(userId, 'r2', 'a2', ttl);
      await store.registerTokens(userId, 'r3', 'a3', ttl);
      expect(await store.removeAll(userId)).toBe(true);
      expect(await store.removeAll(userId)).toBe(false);
    });
  });
});
