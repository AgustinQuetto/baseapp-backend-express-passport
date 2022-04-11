const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const session = require("express-session");
const config = require("./config");

const {
  endpoints: {
    frontend: { url: frontendUrl },
  },
} = config;

const mongoose = require("mongoose");

mongoose.connect(config.mongodbConnectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ...config.mongodbAuth,
});

const FileController = require("./controllers/FileController");
const FileControllerInstance = new FileController();

const passport = require("passport");
const PassportController = require("./controllers/PassportController");

const UserModel = require("./models/UserModel");
const UserService = require("./services/UserService");
const UserServiceInstance = new UserService(UserModel);

const ProfileService = require("./services/ProfileService");
const ProfileServiceInstance = new ProfileService(
  UserModel,
  FileControllerInstance
);

const AuthController = require("./controllers/AuthController");
const AuthControllerInstance = new AuthController(
  UserServiceInstance,
  ProfileServiceInstance,
  FileControllerInstance
);

const MongoStore = require("connect-mongo");
config.session.store = MongoStore.create({
  mongoUrl: config.mongodbConnectionString,
  secret: config.session.secret,
});

module.exports = (server) => {
  server.use(cookieParser());
  server.use(bodyParser.json({ limit: "50mb" }));
  server.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
  server.use(session(config.session));
  server.use(passport.initialize());
  PassportController(AuthControllerInstance, passport);

  //Passport Routes
  server.post("/login", (req, res, next) => {
    passport.authenticate("login", (e, user, info) => {
      if (e) return next(e);
      if (info) return res.status(401).json(info);
      req.logIn(user, (e) => {
        if (e) return res.sendStatus(500);
        req.session.save(() => {
          return res.json(req.user);
        });
      });
    })(req, res, next);
  });

  server.post(
    "/signup",
    passport.session(),
    passport.authenticate("signup"),
    (req, res) => {
      res.json(req.user);
    }
  );

  server.get(
    "/auth/github",
    passport.authenticate("github", { scope: ["user:email"] })
  );

  server.get(
    "/auth/github/callback",
    passport.session(),
    passport.authenticate("github", { failureRedirect: `${frontendUrl}/500` }),
    (req, res) => {
      return res.redirect(`${frontendUrl}/protected`);
    }
  );

  server.get(
    "/auth/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
    })
  );

  server.get(
    "/auth/google/callback",
    passport.session(),
    passport.authenticate("google", {
      successRedirect: `${frontendUrl}/protected`,
      failureRedirect: `${frontendUrl}/500`,
    })
  );

  server.get("/auth/twitter", passport.authenticate("twitter"));

  server.get(
    "/auth/twitter/callback",
    passport.session(),
    passport.authenticate("twitter", { failureRedirect: `${frontendUrl}/500` }),
    (req, res) => {
      res.redirect(`${frontendUrl}/protected`);
    }
  );

  server.get(
    "/auth/linkedin",
    passport.authenticate("linkedin"),
    (req, res) => {}
  );

  server.get(
    "/auth/linkedin/callback",
    passport.session(),
    passport.authenticate("linkedin", {
      successRedirect: `${frontendUrl}/protected`,
      failureRedirect: `${frontendUrl}/500`,
    })
  );

  server.get("/me", passport.session(), (req, res) => {
    if (req.user) return res.json(req.user);
    return res.sendStatus(401);
  });

  server.get("/unlink/:strategy", passport.session(), async (req, res) => {
    const strategy = req.params.strategy;
    const unlinked = await AuthControllerInstance.unlink(req, strategy);
    return res.redirect("/networks");
  });

  server.get("/logout", passport.session(), (req, res) => {
    req.logout();
    return res.redirect("/");
  });

  return server;
};
