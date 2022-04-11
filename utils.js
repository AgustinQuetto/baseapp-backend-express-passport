const bcrypt = require("bcrypt-nodejs");

const self = {};

self.generateHash = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};
self.validPassword = (password, localPassword) => {
  return bcrypt.compareSync(password, localPassword);
};

module.exports = self;
