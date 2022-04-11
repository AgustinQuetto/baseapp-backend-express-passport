const LocalStrategy = require("passport-local").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const TwitterStrategy = require("passport-twitter").Strategy;
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const LinkedInStrategy = require("passport-linkedin-oauth2").Strategy;
const config = require("../config");

module.exports = (AuthController, passport) => {
  passport.serializeUser(async (user, done) => {
    if (user[1]) user = user[1];
    user = await user;
    done(null, user._id);
  });
  passport.deserializeUser(async (id, done) => {
    const deserialized = await AuthController.deserialize(id);
    done(false, deserialized);
  });

  passport.use(
    "login",
    new LocalStrategy(config.auth.local, async (req, email, password, done) => {
      const result = await AuthController.login(email, password);
      return done(...result);
    })
  );

  passport.use(
    "signup",
    new LocalStrategy(config.auth.local, async (req, email, password, done) => {
      const result = await AuthController.signup(req);
      return done(...result);
    })
  );

  passport.use(
    new GitHubStrategy(
      config.auth.github,
      async (req, token, refreshToken, profile, done) => {
        const result = await AuthController.github(req, profile);
        return done(null, result);
      }
    )
  );

  passport.use(
    new GoogleStrategy(
      config.auth.google,
      async (req, accessToken, refreshToken, profile, done) => {
        const result = await AuthController.google(req, profile);
        return done(null, result);
      }
    )
  );

  passport.use(
    new TwitterStrategy(
      config.auth.twitter,
      async (req, token, tokenSecret, profile, done) => {
        const result = await AuthController.twitter(req, profile);
        return done(null, result);
      }
    )
  );

  passport.use(
    new LinkedInStrategy(
      config.auth.linkedin,
      async (req, accessToken, refreshToken, profile, done) => {
        const result = await AuthController.linkedin(req, profile);
        return done(null, result);
      }
    )
  );
};
