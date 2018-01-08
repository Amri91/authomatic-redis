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
      expect(await store.registerTokens(userId, refreshToken, accessToken, ttl)).toBeTruthy();
    });
  });

  describe('#getAccessToken', () => {
    it('Should retrieve correct token', async () => {
      await store.registerTokens(userId, 'r1', '1', ttl);
      await store.registerTokens(userId, refreshToken, accessToken, ttl);
      await store.registerTokens(userId, 'r3', '3', ttl);
      expect(await store.getAccessToken(userId, refreshToken)).toBe(accessToken);
    });
  });

  describe('#verify', () => {
    it('Should return true if refresh token and user id pair exist', async () => {
      await store.registerTokens(userId, refreshToken, accessToken, ttl);
      expect(await store.verify(userId, refreshToken)).toBeTruthy();
    });
    it('Should return false if refresh token and user id pair do not exist', async () => {
      expect(await store.verify(userId, refreshToken)).toBeFalsy();
    });
  });

  describe('#remove', () => {
    it('Should return true if record is removed', async () => {
      await store.registerTokens(userId, refreshToken, accessToken, ttl);
      expect(await store.remove(userId, refreshToken)).toBeTruthy();
      expect(await store.verify(userId, refreshToken)).toBeFalsy();
    });
    it('Should return false if record does not exist', async () => {
      expect(await store.remove(userId, refreshToken)).toBeFalsy();
    });
  });

  describe('#removeAll', () => {
    it('Should remove all refresh tokens for a single user', async () => {
      await store.registerTokens(userId, refreshToken, accessToken, ttl);
      await store.registerTokens(userId, 'r1', 'a1', ttl);
      await store.registerTokens(userId, 'r2', 'a2', ttl);
      await store.registerTokens(userId, 'r3', 'a3', ttl);
      expect(await store.removeAll(userId)).toBeTruthy();
      expect((await store._scanKeys(userId)).length).toBe(0);
    });
  });
});
