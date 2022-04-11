const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const utils = require("../utils");
const ProfileSchema = require("./ProfileModel");

const userSchema = Schema(
  {
    email: String,
    password: String,
    twitter: {
      id: String,
      username: String,
      emails: [String],
    },
    google: {
      id: String,
      emails: [String],
      email_verified: { type: Boolean, default: false },
    },
    github: {
      id: String,
      username: String,
      emails: [String],
    },
    linkedin: {
      id: String,
      username: String,
      emails: [String],
    },
    emails: [String],
    profile: ProfileSchema,
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

userSchema.methods.generateHash = utils.generateHash;

userSchema.methods.validPassword = (password, modelPassword) => {
  return utils.validPassword(password, modelPassword);
};

module.exports = mongoose.model("User", userSchema);
