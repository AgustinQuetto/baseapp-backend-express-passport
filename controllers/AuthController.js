const utils = require("../utils");
const { v4: uuidv4 } = require("uuid");

class AuthController {
  constructor(userService, profileService, fileController) {
    this.userService = userService;
    this.profileService = profileService;
    this.fileController = fileController;
    this.messages = {
      invalid: { message: "Wrong email or password." },
      alreadyExists: {
        message: "El correo electrónico se encuentra en uso.",
      },
      error: {
        message: "Email is in use.",
      },
      confirm_password: {
        message: "Passwords do not match.",
      },
      profile_creation_error: {
        message: "There was an error creating your profile.",
      },
      github_type_error: {
        message: "GitHub account must be personal.",
      },
    };
  }

  async deserialize(id) {
    return await this.userService.findOne(id, "");
  }

  async login(email, password) {
    if (email) email = email.toLowerCase();
    const user = await this.userService.findOne(
      {
        email: email,
      },
      "",
      {}
    );
    if (!user || !user.validPassword(password, user._doc.password))
      return [null, false, this.messages.invalid];
    return [null, user];
  }

  async signup(req) {
    const body = req.body;
    if (body.profile.picture) {
      try {
        const uploaded = await this.fileController.putBase64ImageS3(
          body.profile.picture,
          "profile/avatar/"
        );
        if (uploaded.url) body.profile.picture = uploaded.url;
      } catch (e) {
        console.log(e);
      }
    }

    if (body.email) body.email = body.email.toLowerCase();
    if (body.password != body.confirm_password) {
      return [null, false, this.messages.confirm_password];
    }
    delete body.confirm_password;
    if (!req.user) {
      const user = await this.userService.findOne({
        email: body.email,
      });
      if (user) {
        return [null, false, this.messages.alreadyExists];
      } else {
        body.password = utils.generateHash(body.password);
        const created = await this.userService.save(body);
        if (!created) return [null, false, this.messages.error];
        delete created.password;
        return [null, created];
      }
    } else if (!req.user.email) {
      const user = await this.userService.findOne({
        email: body.email,
      });
      if (!user) return [null, false, this.messages.alreadyExists];

      if (user) {
        return [null, false, this.messages.alreadyExists];
      }

      const _user = req.user;
      _user.email = body.email;
      _user.password = _user.generateHash(body.password);
      const updated = await UserService.update({ _id: _user._id }, _user);

      if (!updated) return [null, false, this.messages.error];
      delete updated.password;
      return [null, updated];
    } else {
      return [null, req.user];
    }
  }

  async github(req, profile) {
    const emails = profile.emails
      ? profile.emails.map((email) => {
          return email.value;
        })
      : [];
    const github = {
      id: profile.id,
      username: profile.username,
      emails: emails,
    };
    if (req.user) {
      const currentUser = await this.userService.update(
        { _id: req.user._id },
        {
          github,
        }
      );
      if (currentUser) return [null, currentUser];
    }
    if (profile._json.type != "User")
      return [this.messages.github_type_error.message, false];
    const nameSplitted =
      profile._json && profile._json.name
        ? profile._json.name.split(" ")
        : ["", ""];
    const onCreate = {
      profile: {
        username: `${profile.username}_${uuidv4()}`,
        picture: profile.photos[0].value,
        name: nameSplitted[0],
        surname: nameSplitted[1],
        picture: profile?.photos?.[0]?.value,
      },
      github,
    };
    const onUpdate = {
      github,
    };

    let to = [];
    if (emails.length) {
      to = [emails[0], nameSplitted[0]];
    }

    const user = await this.userService.findUpdateOrCreate(
      { "github.id": profile.id },
      onCreate,
      onUpdate,
      "",
      { new: true },
      (to = to)
    );

    if (!user) return [null, false, this.messages.error.message];
    return [null, user];
  }

  async google(req, profile) {
    const google = {
      id: profile.id,
      emails: [profile.email],
      email_verified: profile.email_verified,
    };
    if (req.user) {
      const currentUser = await this.userService.update(
        { _id: req.user._id },
        {
          google,
        }
      );
      if (currentUser) return [null, currentUser];
    }
    const onCreate = {
      profile: {
        username: profile.email.split("@")[0],
        picture: profile.picture,
        name: profile.given_name,
        surname: profile.family_name,
      },
      google,
    };
    const onUpdate = {
      google,
    };

    let to = [];
    if (google.emails) {
      to = [google.emails[0], profile.given_name];
    }

    const user = await this.userService.findUpdateOrCreate(
      { $or: [{ "google.id": profile.id }, { email: profile.email }] },
      onCreate,
      onUpdate,
      "",
      { new: true },
      to
    );

    if (!user) return [null, false, this.messages.error.message];
    return [null, user];
  }

  async twitter(req, profile) {
    const twitter = {
      id: profile.id,
      username: profile.username,
    };
    const email = profile?._json?.email;
    if (email) twitter.emails = [email];

    if (req.user) {
      const currentUser = await this.userService.update(
        { _id: req.user._id },
        {
          twitter,
        }
      );
      if (currentUser) return [null, currentUser];
    }
    const onCreate = {
      profile: {
        username: `${profile.username}_${uuidv4()}`,
        picture: profile?._json?.profile_image_url_https || "",
      },
      twitter,
    };
    const onUpdate = {
      twitter,
    };

    let to = [];
    if (email) {
      to = [email, onCreate.profile.username];
    }

    const user = await this.userService.findUpdateOrCreate(
      { "twitter.id": profile.id },
      onCreate,
      onUpdate,
      "",
      { new: true },
      to
    );

    if (!user) return [null, false, this.messages.error.message];
    return [null, user];
  }

  async linkedin(req, profile) {
    const emails = profile.emails
      ? profile.emails.map((email) => {
          return email.value;
        })
      : [];
    const linkedin = {
      id: profile.id,
      username: profile.username,
      emails: emails,
    };
    if (req.user) {
      const currentUser = await this.userService.update(
        { _id: req.user._id },
        {
          linkedin,
        }
      );
      if (currentUser) return [null, currentUser];
    }
    const onCreate = {
      profile: {
        username: `${profile.displayName.split(" ").join("")}_${uuidv4()}`,
        name: profile.name.givenName,
        surname: profile.name.familyName,
        picture: profile?.photos?.[2]?.value,
      },
      linkedin,
    };
    const onUpdate = {
      linkedin,
    };

    let to = [];
    if (emails.length) {
      to = [emails[0], profile.name.givenName];
    }

    const user = await this.userService.findUpdateOrCreate(
      { "linkedin.id": profile.id },
      onCreate,
      onUpdate,
      "",
      { new: true },
      to
    );

    if (!user) return [null, false, this.messages.error.message];
    return [null, user];
  }

  async unlink(req, loginType) {
    if (req.user) {
      const user = await this.userService.update(
        { _id: req.user._id },
        {
          $unset: { [loginType]: 1 },
        }
      );
      if (user) return true;
    }
    return false;
  }
}

module.exports = AuthController;
