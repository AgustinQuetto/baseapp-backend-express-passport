class ProfileService {
  constructor(userModel, fileController) {
    this.userModel = userModel;
    this.fileController = fileController;
  }

  find(data = {}, select = "", options = {}, limit = 10) {
    options = { ...options, ...{ lean: true } };
    let find = this.userModel.find(data, select, options);
    if (limit) find.limit(10);
    return find.exec();
  }

  findOne(data = "", select = "", params = { lean: true }) {
    if (typeof data == "string") data = { "profile.username": data };
    return this.userModel.findOne(data, select, params).exec();
  }

  simpleUpdate(query = {}, body = {}, opts = { lean: true }) {
    if (typeof query == "string") query = { "profile.username": query };
    return this.userModel.findOneAndUpdate(query, body, opts).exec();
  }

  async update(
    query = false,
    data = {},
    opts = { new: true, useFindAndModify: false }
  ) {
    if (!query) return false;
    if (typeof query == "string") query = { _id: query };

    if (opts) {
      opts = {
        ...{ new: true, useFindAndModify: false },
        ...opts,
      };
    }

    const profile = data.profile;

    if (profile.picture && !profile.picture.startsWith("http")) {
      try {
        const uploaded = await this.fileController.putBase64ImageS3(
          profile.picture,
          "profile/avatar/"
        );
        if (uploaded.url) profile.picture = uploaded.url;
      } catch (e) {
        console.log(e);
      }
    }

    return this.userModel.findOneAndUpdate(query, body, opts).exec();
  }
}

module.exports = ProfileService;
