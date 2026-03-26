const express = require("express");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const { google } = require("googleapis");

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// ---------------- LOGIN ----------------
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "1234") {
    res.sendFile(path.join(__dirname, "public", "dashboard.html"));
  } else {
    res.send("❌ Invalid login");
  }
});

// ---------------- GOOGLE DRIVE SETUP ----------------
const auth = new google.auth.GoogleAuth({
  keyFile: "credentials.json",
  scopes: ["https://www.googleapis.com/auth/drive"],
});

const drive = google.drive({ version: "v3", auth });

// ---------------- MULTER ----------------
const upload = multer({ dest: "uploads/" });

// ---------------- UPLOAD ----------------
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const fileMetadata = {
      name: req.file.originalname,
      parents: ["1jFLN4paK-CTEEVHHrRuRKtU-ScNiFaUy"], // 🔥 change this
    };

    const media = {
      mimeType: req.file.mimetype,
      body: fs.createReadStream(req.file.path),
    };

    const file = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: "id",
    });

    fs.unlinkSync(req.file.path);

    res.send({ message: "Uploaded", id: file.data.id });
  } catch (err) {
    res.status(500).send(err);
  }
});

// ---------------- LIST FILES ----------------
app.get("/files", async (req, res) => {
  const response = await drive.files.list({
    q: "'YOUR_FOLDER_ID' in parents and trashed=false",
    fields: "files(id, name)",
  });

  res.json(response.data.files);
});

// ---------------- DELETE ----------------
app.delete("/delete/:id", async (req, res) => {
  await drive.files.delete({
    fileId: req.params.id,
  });

  res.send("Deleted");
});

// ---------------- DOWNLOAD ----------------
app.get("/download/:id", (req, res) => {
  const fileId = req.params.id;
  res.redirect(
    `https://drive.google.com/uc?export=download&id=${fileId}`
  );
});

// ---------------- SERVER ----------------
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Server running on " + PORT);
});
