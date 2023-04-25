const express = require("express");
const router = express.Router();
const multer = require("multer");
const sgMail = require("@sendgrid/mail");
const hbs = require("handlebars");
const fs = require("fs");
const path = require("path");

sgMail.setApiKey(process.env.SG_MAIL_KEY);

router.post("/send/post-status", async (req, res) => {
  const { reciever, reasons, imageUri, postTitle, username } = req.body;

  console.log(req.body);

  if (!reciever || !reasons || !imageUri || !postTitle) {
    return res.status(400).send({
      message: "Reciever mail, reasons, image URL and post title are required",
      success: false,
    });
  }

  var source = `
  <strong>Hey {{username}}!</strong>
  <p>We thank you for supporting us in bringing better society by sharing the crime you came across. But we are sorry to inform you that the post you have uploaded recently got rejected!
  </p>
  <strong>We have attached image related to that post:</strong>
  <img src={{imageUri}}/>
  <p>Your post has been rejected due to following reasons: </p>
  <ul>
  {{#each reasons}}
  <li>{{this.reason}}</li>
  {{/each}}
  </ul>
  <p><b><i>Please try to improve the post next time!</i></b></p>

  <p>Regards,</p>

  <p>Admin, Cop-on-Cloud </p>
  <br />
  <img src="https://cop-on-cloud.s3.us-east-1.amazonaws.com/image-1681067033573" width="50px" height="50px" />
  `;
  var template = hbs.compile(source);

  var data = {
    username,
    imageUri,
    reasons,
  };
  var result = template(data);

  const msg = {
    to: reciever, // Change to your recipient
    from: "coponcloud23@gmail.com", // Change to your verified sender
    subject: `Rejecting post: ${postTitle}`,
    html: result,
  };

  try {
    sgMail.send(msg);
    // return res.send(result);
    // return res.send({ message: "Mail sent succesfully!", success: true });
    res.send({ success: true, message: "Email send succesfully!" });
  } catch (err) {
    res.send({ success: false, message: err.message });
  }
});

module.exports = router;
