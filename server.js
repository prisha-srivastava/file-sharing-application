const express = require("express");
const app = express();
const path = require("path");
const PORT = process.env.PORT || 3000;
const cors = require("cors");

app.use(express.static("public"));
app.use(express.json());
const connectDB = require("./config/db");
connectDB(); //connecting database

//Cors
const corsOptions = {
  origin: process.env.ALLOWED_CLIENTS.split(","),
};

app.cors(cors(corsOptions));

//Template engine
//to let the application know that all the html files are in views folder
app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "ejs");

//Routes
app.use("/api/files", require("./routes/files"));
app.use("/files", require("./routes/show"));
app.use("/files/download", require("./routes/download"));

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
