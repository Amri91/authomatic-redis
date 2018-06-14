'use strict';

const {promisify} = require('util');
const redis = require('redis');
const Store = require('../index');

describe('RedisStoreCreator', () => {
  let client;

  it('Should create a store successfully', () => {
    ({client} = Store());
    expect(client).toBeTruthy();
  });

  afterEach(done => {
    client.flushall(e => {
      client.quit();
      done(e);
    });
  });
});

describe('RedisStore', () => {
  let store, client, getAsync;
  const userId = 'userId', refreshTokenJTI = '99999999', accessTokenJTI = '55555555', ttl = 60000;

  beforeEach(() => {
    client = redis.createClient();
    getAsync = promisify(client.get).bind(client);
    store = Store({client});
  });
  afterEach(done => {
    client.flushall(() => {
      client.quit();
      // Ignore error
      done();
    });
  });

  describe('#registerTokens', () => {
    it('Should store access and refresh tokens', async () => {
      expect(await store.add(userId, refreshTokenJTI, accessTokenJTI, ttl)).toBe(true);
    });
  });

  describe('#getAccessToken', () => {
    it('Should retrieve correct token', async () => {
      await store.add(userId, 'r1', 'a1', ttl);
      await store.add(userId, refreshTokenJTI, accessTokenJTI, ttl);
      await store.add(userId, 'r3', 'a3', ttl);
      expect(await getAsync(`${userId}_authomatic_${refreshTokenJTI}`)).toBe(accessTokenJTI);
    });
  });

  describe('#remove', () => {
    it('Should return true if record is removed', async () => {
      await store.add(userId, refreshTokenJTI, accessTokenJTI, ttl);
      expect(await store.remove(userId, refreshTokenJTI)).toBe(true);
      expect(await store.remove(userId, refreshTokenJTI)).toBe(false);
    });
    it('Should return false if record does not exist', async () => {
      expect(await store.remove(userId, refreshTokenJTI)).toBe(false);
    });
  });

  describe('#removeAll', () => {
    it('Should remove all refresh tokens for a single user', async () => {
      await store.add(userId, refreshTokenJTI, accessTokenJTI, ttl);
      await store.add(userId, 'r1', 'a1', ttl);
      await store.add(userId, 'r2', 'a2', ttl);
      await store.add(userId, 'r3', 'a3', ttl);
      expect(await store.removeAll(userId)).toBe(true);
      expect(await store.removeAll(userId)).toBe(false);
    });
    it('Should expect failing', async () => {
      store.client.quit();
      expect(await store.removeAll(userId).catch(e => {
        expect(e).toBeTruthy();
      }));
    });
  });
});
