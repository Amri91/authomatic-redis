'use strict';

const Store = require('../store');

describe('RedisStore', () => {
  let store, fakeClient, _set, _del;
  const userId = 'userId', refreshTokenJTI = '99999999', accessTokenJTI = '55555555', ttl = 60000;
  beforeEach(() => {
    _set = jest.fn();
    _del = jest.fn();
    fakeClient = {
      set: (...args) => {
        args.pop()();
        _set(...args);
      },
      del: (...args) => {
        args.pop()();
        _del(...args);
      }
    };
    store = Store({client: fakeClient});
  });

  describe('#add', () => {
    it('Should call set with correct arguments', async () => {
      await store.add(userId, refreshTokenJTI, accessTokenJTI, ttl);
      expect(_set.mock.calls[0][0]).toBe(`${userId}_authomatic_${refreshTokenJTI}`);
      expect(_set.mock.calls[0][1]).toBe(accessTokenJTI);
      expect(_set.mock.calls[0][2]).toBe(`EX`);
      expect(_set.mock.calls[0][3]).toBe(ttl);
    });
    it('Should not allow registering userIds that contain base string', () => {
      expect(
        () => store.add('123_authomatic_14234', refreshTokenJTI, accessTokenJTI, ttl)
      ).toThrow();
    });
  });

  describe('#remove', () => {
    it('Should call del with correct arguments', async () => {
      await store.remove(userId, refreshTokenJTI);
      expect(_del.mock.calls[0][0]).toBe(`${userId}_authomatic_${refreshTokenJTI}`);
    });
  });
});
