# authomatic-redis
[![Build Status](https://app.travis-ci.com/Amri91/authomatic-redis.svg?branch=master)](https://app.travis-ci.com/Amri91/authomatic-redis)
[![Coverage Status](https://coveralls.io/repos/github/Amri91/authomatic-redis/badge.svg?branch=master)](https://coveralls.io/github/Amri91/authomatic-redis?branch=master)

Redis store for [Authomatic](https://github.com/Amri91/authomatic)

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
 