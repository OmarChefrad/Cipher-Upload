require("dotenv").config()
const express = require("express")
const app = express()
const bcrypt = require("bcrypt")
const multer = require("multer")
const req = require("express/lib/request")
const mongoose = require("mongoose")
const File = require("./models/file")

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("Connected to MongoDB..."))
  .catch((err) => console.error("Could not connect to MongoDB...", err))

const upload = multer({ dest: "uploads" })

app.set("view engine", "ejs")

app.get("/", (req, res) => {
  res.render("index")
})

app.post("/upload", upload.single("file"), async (req, res) => {
  const fileData = {
    path: req.file.path,
    originalName: req.file.originalname,
  }
  if (req.body.password != null && req.body.password != "") {
    fileData.password = await bcrypt.hash(req.body.password, 10)
  }

  const file = await File.create(fileData)
  console.log(file)
  res.send(file.originalName)
})

app.listen(process.env.PORT)
