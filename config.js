const env = { ...process, ...process.env };
const getConfig = require("./getConfig");
const self = {};

self.version = "0.0";

self.enviroment = getConfig(env.NODE_ENV, "local");

self.port = getConfig(env.PORT, 3000);

self.redis = {
  host: getConfig(env.REDIS_HOST, "redis", "127.0.0.1"),
  port: getConfig(env.REDIS_PORT, 6379),
};

self.aws = {
  s3: {
    accessKeyId: getConfig(env.AWS_ACCESS_KEY_ID, ""),
    secretAccessKey: getConfig(env.AWS_SECRET_ACCESS_KEY, ""),
  },
};

self.mongodb = {
  ip: getConfig(env.MONGODB_IP, `localhost`),
  port: getConfig(env.MONGODB_PORT, `27017`),
  user: getConfig(env.MONGODB_USER, ``),
  password: getConfig(env.MONGODB_PASSWORD, ``),
  database: getConfig(env.MONGODB_DATABASE, `example`),
  authSource: getConfig(env.MONGODB_AUTHSOURCE, `admin`),
};

self.mongodbConnectionString = `mongodb://${self.mongodb.ip}:${self.mongodb.port}/${self.mongodb.database}`;

self.mongodbAuth = {};
self.session = {
  key: "connect.sid",
  secret: getConfig(env.SESSION_SECRET, `testing`),
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 2 * 60 * 60 * 1000 },
};

self.endpoints = {
  backend: {
    url:
      self.enviroment == "production"
        ? `https://api.example.com`
        : self.enviroment == "development"
        ? `https://api-test.example.com`
        : `http://localhost:${self.port}`,
  },
  frontend: {
    url:
      self.enviroment == "production"
        ? `https://example.com`
        : self.enviroment == "development"
        ? `https://test.example.com`
        : `http://localhost:3001`,
  },
};

if (self.mongodb.user && self.mongodb.user != "") {
  self.mongodbAuth.auth = { authSource: self.mongodb.authSource };
  self.mongodbAuth.user = self.mongodb.user;
  if (self.mongodb.password && self.mongodb.password != "") {
    self.mongodbAuth.pass = self.mongodb.password;
  }
}

self.auth = {
  local: {
    usernameField: "email",
    passwordField: "password",
    passReqToCallback: true,
  },

  github: {
    clientID: getConfig(env.GITHUB_CLIENTID),
    clientSecret: getConfig(env.GITHUB_CLIENT_SECRET),
    callbackURL:
      self.enviroment == "production"
        ? `https://example.com/auth/github/callback`
        : self.enviroment == "development"
        ? `https://test.example.com/auth/github/callback`
        : `http://localhost:${self.port}/auth/github/callback`,
    passReqToCallback: true,
  },

  facebook: {
    clientID: getConfig(env.FACEBOOK_CLIENTID),
    clientSecret: getConfig(env.FACEBOOK_CLIENTSECRET),
    callbackURL:
      self.enviroment == "production"
        ? `https://example.com/auth/facebook/callback`
        : self.enviroment == "development"
        ? `https://test.example.com/auth/facebook/callback`
        : `http://localhost:${self.port}/auth/facebook/callback`,
    profileURL:
      "https://graph.facebook.com/v2.5/me?fields=first_name,last_name,email",
    profileFields: ["id", "email", "name"],
    passReqToCallback: true,
  },

  twitter: {
    consumerKey: getConfig(env.TWITTER_CONSUMERKEY),
    consumerSecret: getConfig(env.TWITTER_CONSUMERSECRET),
    callbackURL:
      self.enviroment == "production"
        ? `https://example.com/auth/twitter/callback`
        : self.enviroment == "development"
        ? `https://test.example.com/auth/twitter/callback`
        : `http://localhost:${self.port}/auth/twitter/callback`,
    userProfileURL:
      "https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true",
    passReqToCallback: true,
  },

  google: {
    clientID: getConfig(env.GOOGLE_CLIENTID),
    clientSecret: getConfig(env.GOOGLE_CLIENTSECRET),
    callbackURL:
      self.enviroment == "production"
        ? `https://example.com/auth/google/callback`
        : self.enviroment == "development"
        ? `https://test.example.com/auth/google/callback`
        : `http://localhost:${self.port}/auth/google/callback`,
    passReqToCallback: true,
  },

  linkedin: {
    clientID: getConfig(env.LINKEDIN_KEY),
    clientSecret: getConfig(env.LINKEDIN_SECRET),
    callbackURL:
      self.enviroment == "production"
        ? `https://example.com/auth/linkedin/callback`
        : self.enviroment == "development"
        ? `https://test.example.com/auth/linkedin/callback`
        : `http://localhost:${self.port}/auth/linkedin/callback`,
    scope: ["r_emailaddress", "r_liteprofile"],
    state: true,
    passReqToCallback: true,
  },
};

module.exports = self;
