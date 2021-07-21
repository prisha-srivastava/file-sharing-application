const router = require("express").Router(); //import router module from
const multer = require("multer");
const path = require("path");
const File = require("../models/file");
const { v4: uuidv4 } = require("uuid");

//multer configuration, creating storage object. which is required in multer
let storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    //unique name for each file which will be uploaded. path module used for adding extension of file.
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

let upload = multer({
  storage: storage,
  limit: { filesize: 1000000 * 100 }, // limit of filesize to uplooad is 100mb
}).single("myfile"); //single file uploaded, parameter myfile from request that we created

router.post("/", (req, res) => {
  //Store file

  upload(req, res, async (err) => {
    //Validate request we have received
    if (!req.file) {
      return res.json({ error: "All fields are required" });
    }

    if (err) {
      return res.status(500).send({ error: err.message });
    }

    //store into database
    const file = new File({
      filename: req.file.filename,
      uuid: uuidv4(),
      path: req.file.path,
      size: req.file.size,
    });

    const response = await file.save();
    return res.json({
      file: `${process.env.APP_BASE_URL}/files/${response.uuid}`,
    });
  });

  //send response ie. the download link
});

router.post("/send", async (req, res) => {
  const { uuid, emailFrom, emailTo } = req.body;

  //validate request
  if (!uuid || !emailTo || !emailFrom) {
    return res.status(422).send({ error: "All fields are required." });
  }

  //Get data from database
  const file = await File.findOne({ uuid: uuid });

  //if file has already been sent once then it will not be sent again , so check that->
  if (file.sender) {
    return res.status(422).send({ error: "Email already sent" });
  }

  file.sender = emailFrom;
  file.receiver = emailTo;
  const response = await file.save();

  //Send email
  const sendEmail = require("../services/emailService");

  sendEmail({
    from: emailFrom,
    to: emailTo,
    subject: "File sharing",
    text: `${emailFrom} shared a file with you. `,
    html: require("../services/emailTemplate")({
      emailFrom: emailFrom,
      downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}`,
      size: parseInt(file.size / 1000) + "KB",
      expires: "24 hours",
    }),
  });

  return res.send({ success: true });
});
module.exports = router;
