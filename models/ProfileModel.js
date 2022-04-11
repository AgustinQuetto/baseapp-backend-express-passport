const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const utils = require("../utils");

const schema = mongoose.Schema({
  picture: String,
  username: String,
  name: String,
  surname: String,
  metadata: String,
  verified: { type: Boolean, default: false },
});

schema.index({ metadata: "text" });

module.exports = schema;
