# authomatic-redis
[![Build Status](https://travis-ci.org/wearereasonablepeople/authomatic-redis.svg?branch=master)](https://travis-ci.org/wearereasonablepeople/authomatic-redis)
[![Coverage Status](https://coveralls.io/repos/github/wearereasonablepeople/authomatic-redis/badge.svg?branch=master)](https://coveralls.io/github/wearereasonablepeople/authomatic-redis?branch=master)
[![Maintainability](https://api.codeclimate.com/v1/badges/de17d1c089d4120b8a1f/maintainability)](https://codeclimate.com/github/wearereasonablepeople/authomatic-redis/maintainability)
[![Greenkeeper badge](https://badges.greenkeeper.io/wearereasonablepeople/authomatic-redis.svg)](https://greenkeeper.io/)

Redis store for [Authomatic](https://github.com/wearereasonablepeople/authomatic)

## install
```
npm install authomatic-redis
```

## Usage
```javascript
const Store = require('authomatic-redis');
// Store options
// Note: userIds cannot contain base strings
// const store = Store({redisOptions: {/*https://www.npmjs.com/package/redis*/}, baseString: 'String'})
// OR
// const redis = require('redisredis'),
// const store = Store({client: redis.createClient()});
const store = Store();
const Authomatic = require('authomatic');
const authomatic = Authomatic({store}); 
// authomatic is ready

// You many use the redis client if needed
// store.client.quit()
// Enjoy
```
## Documentation
Store options:
 * @param {Object} [options.redisOptions] options to be passed directly to the redis client if you do not pass a redis client.
 * @param {Object} [options.client] redis client provided by the user.
 * @return {{remove, removeAll, add}}
 