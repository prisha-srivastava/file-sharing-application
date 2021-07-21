const router = require("express").Router();
const File = require("../models/file");

router.get("/:uuid", async (req, res) => {
  const file = await File.findOne({ uuid: req.params.uuid });

  //if file with that uuid is not there in database
  if (!file) {
    return res.render("download", { error: "Link has been expired" });
  }

  //if file exists then create the download link->
  const filePath = `${__dirname}/${file.path}`; //saving filepath of uploads  directory

  res.download(filePath);
});

module.exports = router;
