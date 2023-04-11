require("dotenv").config();
const multer = require("multer");
const multerS3 = require("multer-s3");
const { S3Client } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  region: process.env.AWS_S3_RRGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

const upload = (bucketName) =>
  multer({
    storage: multerS3({
      s3,
      bucket: bucketName,
      metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
      },
      key: function (req, file, cb) {
        const extension = file.originalname.split(".").pop();
        cb(null, `image-${Date.now()}.${extension ? extension : ""}`);
      },
    }),
    fileFilter(req, file, cb) {
      file;
      if (!file.originalname.match(/\.(jpeg|jpg|png|mp4|mkv)$/)) {
        console.log(file.originalname.split(".").pop());
        return cb(new Error("Please upload a jpeg/jpg/png document"));
      }
      cb(undefined, true);
    },
  });

module.exports = upload;
