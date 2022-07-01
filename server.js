require("dotenv").config()
const express = require("express")
const app = express()
const bcrypt = require("bcrypt")
const multer = require("multer")
const req = require("express/lib/request")
const mongoose = require("mongoose")
const File = require("./models/file")
var favicon = require("serve-favicon")
var path = require("path")
//understand multiple form
app.use(express.urlencoded({ extended: true }))
//icon
app.use(favicon(__dirname + "/public/images/favicon.png"))
//mongoDb
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("Connected to MongoDB..."))
  .catch((err) => console.error("Could not connect to MongoDB...", err))
//multer library
const upload = multer({ dest: "uploads" })
//ejs like html but with js integration
app.set("view engine", "ejs")
//render
app.get("/", (req, res) => {
  res.render("index")
})
//upload
app.post("/upload", upload.single("file"), async (req, res) => {
  const fileData = {
    path: req.file.path,
    originalName: req.file.originalname,
  }
  if (req.body.password != null && req.body.password != "") {
    fileData.password = await bcrypt.hash(req.body.password, 10)
  }

  const file = await File.create(fileData)
  res.render("index", { fileLink: `${req.headers.origin}/file/${file.id}` })
})

app.route("/file/:id").get(handelDownload).post(handelDownload)

//download
async function handelDownload(req, res) {
  const file = await File.findById(req.params.id)
  if (file.password != null) {
    if (req.body.password == null) {
      res.render("password")
      return
    }
  }
  if (!(await bcrypt.compare(req.body.password, file.password))) {
    // console.log(file.password)
    res.render("password", { error: true })
    return
  }

  file.downloadCount++
  await file.save()
  res.download(file.path, file.originalName)
}

app.listen(process.env.PORT)
