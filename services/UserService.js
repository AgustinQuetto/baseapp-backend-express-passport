const RedisService = require("./RedisService");

class UserService {
  constructor(userModel) {
    this.userModel = userModel;
  }

  find(data = {}, select = "", sort = false) {
    const query = this.userModel.find(data, select, { lean: true });
    if (sort) {
      query.sort(sort);
    }
    return query.exec();
  }

  findOne(data = {}, select = "", params = { lean: true }) {
    if (typeof data == "string") data = { _id: data };
    return this.userModel.findOne(data, select, params).exec();
  }

  save(data = {}) {
    const user = new this.userModel(data);

    RedisService.del("users-recents");
    return user.save({ checkKeys: false });
  }

  update(
    query = false,
    data = {},
    opts = { new: true, useFindAndModify: false }
  ) {
    if (!query) return false;
    return this.userModel.findOneAndUpdate(query, data, opts).exec();
  }

  delete(query) {
    if (!query._id) {
      return false;
    }
    return this.userModel.findOneAndDelete(query).exec();
  }

  async findUpdateOrCreate(
    findData = {},
    dataOnCreate = {},
    dataOnUpdate = {},
    select = "",
    options = { lean: true },
    to = []
  ) {
    const found = await this.findOne(findData, select);
    if (found) {
      const updated = await this.update(
        { _id: found._id },
        dataOnUpdate,
        options
      );
      return updated;
    }
    const created = await this.save(dataOnCreate);
    return created;
  }
}

module.exports = UserService;
