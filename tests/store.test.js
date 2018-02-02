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
    store = new Store({client: fakeClient});
  });

  describe('#constructor', () => {
    it('should throw an error if the client was not provided', () => {
      expect(() => new Store({})).toThrow();
    });
    it('should respond to changing base string', () => {
      const newStore = new Store({client: fakeClient, baseString: 'someString'});
      expect(newStore._getKeyPrefix(userId).includes('someString')).toBeTruthy();
    });
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

  describe('#removeAll', () => {
    it('Should remove all refresh tokens for a single user', async () => {
      store._scanKeys = jest.fn(() => ['1', '2', '3']);
      await store.removeAll(userId);
      expect(_del.mock.calls.length).toBe(1);
      expect(_del.mock.calls[0][0]).toEqual(['1', '2', '3']);
    });
    it('Should expect an empty array', async () => {
      store._scanKeys = jest.fn(() => []);
      expect(await store.removeAll(userId)).toBeFalsy();
      expect(_del.mock.calls.length).toBe(0);
    });
  });
});
