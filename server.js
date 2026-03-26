const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");

const app = express();
const PORT = 3000;

app.use(express.static("public"));

// Upload temp
const upload = multer({ dest: "temp/" });

// 🔐 Google Drive Auth
const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: ["https://www.googleapis.com/auth/drive"]
});

const drive = google.drive({ version: "v3", auth });

// 👉 Upload to Drive
app.post("/upload", upload.single("file"), async (req, res) => {
    try {
        const fileMetadata = {
            name: req.file.originalname
        };

        const media = {
            mimeType: req.file.mimetype,
            body: fs.createReadStream(req.file.path)
        };

        const response = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: "id"
        });

        fs.unlinkSync(req.file.path);

        res.send("Uploaded to Drive ✔");
    } catch (err) {
        console.log(err);
        res.send("Upload failed");
    }
});

// 👉 List files
app.get("/files", async (req, res) => {
    try {
        const response = await drive.files.list({
            pageSize: 20,
            fields: "files(id, name)"
        });

        res.json(response.data.files);
    } catch (err) {
        console.log(err);
        res.json([]);
    }
});

// 👉 Delete file
app.delete("/delete/:id", async (req, res) => {
    try {
        await drive.files.delete({
            fileId: req.params.id
        });

        res.send("Deleted");
    } catch (err) {
        res.send("Delete failed");
    }
});

// 👉 Download
app.get("/download/:id", (req, res) => {
    const url = `https://drive.google.com/uc?export=download&id=${req.params.id}`;
    res.redirect(url);
});

// 👉 Play video
app.get("/video/:id", (req, res) => {
    const url = `https://drive.google.com/uc?export=preview&id=${req.params.id}`;
    res.redirect(url);
});

app.listen(PORT, () => console.log("Server running"));
