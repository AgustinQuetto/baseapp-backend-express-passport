const { v4: uuidv4 } = require("uuid");
const AWS = require("aws-sdk");
const config = require("../config");

class FileController {
  constructor() {}

  putBase64ImageS3(base64, path = "/", read = "public-read") {
    return new Promise((resolve, reject) => {
      let buf = Buffer.from(
        base64.replace(/^data:image\/\w+;base64,/, ""),
        "base64"
      );

      const uuid = uuidv4();

      const s3 = new AWS.S3(config?.aws?.s3);

      const fullPath = `${path}${uuid}.png`;
      const params = {
        Bucket: "example",
        Body: buf,
        Key: fullPath,
        ContentEncoding: "base64",
        ContentType: "image/png",
      };

      if (read === "public-read") {
        params.ACL = read;
      }

      s3.putObject(params, (err, file) => {
        if (err) {
          reject(err);
        }

        resolve({
          url: `${config?.aws?.s3?.bucket}/${fullPath}`,
        });
      });
    });
  }
}

module.exports = FileController;
