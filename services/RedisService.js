const config = require("../config");
const redis = require("redis");

const self = {};

self.client = redis.createClient(config.redis);

self.get = (key) => {
  return new Promise((resolve, reject) => {
    self.client.get(key, (err, reply) => {
      if (err) return reject(err);
      return resolve(reply);
    });
  });
};

self.set = (key, value, expiration = 0) => {
  return new Promise((resolve, reject) => {
    self.client.set(key, value, (err) => {
      if (err) return reject(err);
      if (expiration) {
        self.client.expire(key, expiration);
      }
      return resolve(true);
    });
  });
};

self.del = (key) => {
  return new Promise((resolve, reject) => {
    self.client.del(key, (err, response) => {
      if (response) {
        return resolve(true);
      } else {
        return resolve(true);
      }
    });
  });
};

module.exports = self;
