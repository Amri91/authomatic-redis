# authomatic-redis
[![Build Status](https://travis-ci.org/wearereasonablepeople/authomatic-redis.svg?branch=master)](https://travis-ci.org/wearereasonablepeople/authomatic-redis)
[![codecov](https://codecov.io/gh/wearereasonablepeople/authomatic-redis/branch/master/graph/badge.svg?token=Bh9Dku3el1)](https://codecov.io/gh/wearereasonablepeople/authomatic-redis)
[![Maintainability](https://api.codeclimate.com/v1/badges/de17d1c089d4120b8a1f/maintainability)](https://codeclimate.com/github/wearereasonablepeople/authomatic-redis/maintainability)

Redis store for [Authomatic](https://github.com/wearereasonablepeople/authomatic)

## install
```
npm install authomatic-redis
```

## Usage
```javascript
const Store = require('authomatic-redis');
// Options
// const store = Store({redisOptions: {/*https://www.npmjs.com/package/redis*/}, baseString: 'String'})
const store = Store();
const Authomatic = require('authomatic');
const authomatic = Authomatic({store}); 

// You many use the redis client if needed
// store.client.quit()
// Enjoy
```
