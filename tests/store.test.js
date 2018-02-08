'use strict';

const Store = require('../store');

describe('RedisStore', () => {
  let store, fakeClient, _get, _set, _exists, _del;
  const userId = 'userId', refreshToken = 'refreshToken', accessToken = 'accessToken', ttl = 60000;
  beforeEach(() => {
    _get = jest.fn();
    _set = jest.fn();
    _exists = jest.fn();
    _del = jest.fn();
    fakeClient = {
      set: (...args) => {
        args.pop()();
        _set(...args);
      },
      get: (...args) => {
        args.pop()();
        _get(...args);
      },
      exists: (...args) => {
        args.pop()();
        _exists(...args);
      },
      del: (...args) => {
        args.pop()();
        _del(...args);
      }
    };
    store = Store({client: fakeClient});
  });

  describe('#registerTokens', () => {
    it('Should call set with correct arguments', async () => {
      await store.registerTokens(userId, refreshToken, accessToken, ttl);
      expect(_set.mock.calls[0][0]).toBe(`authomatic_${userId}_${refreshToken}`);
      expect(_set.mock.calls[0][1]).toBe(accessToken);
      expect(_set.mock.calls[0][2]).toBe(`EX`);
      expect(_set.mock.calls[0][3]).toBe(ttl);
    });
  });

  describe('#getAccessToken', () => {
    it('Should call get with correct arguments', async () => {
      await store.getAccessToken(userId, refreshToken);
      expect(_get.mock.calls[0][0]).toBe(`authomatic_${userId}_${refreshToken}`);
    });
  });

  describe('#verify', () => {
    it('Should call exists with correct arguments', async () => {
      await store.verify(userId, refreshToken);
      expect(_exists.mock.calls[0][0]).toBe(`authomatic_${userId}_${refreshToken}`);
    });
  });

  describe('#remove', () => {
    it('Should call del with correct arguments', async () => {
      await store.remove(userId, refreshToken);
      expect(_del.mock.calls[0][0]).toBe(`authomatic_${userId}_${refreshToken}`);
    });
  });
});
