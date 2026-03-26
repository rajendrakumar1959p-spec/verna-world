const express = require("express");
const multer = require("multer");
const fs = require("fs");
const { google } = require("googleapis");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

// temp upload folder
const upload = multer({ dest: "temp/" });

// 🔐 Google Drive Auth
const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: ["https://www.googleapis.com/auth/drive"]
});

const drive = google.drive({ version: "v3", auth });

// 📁 YOUR FOLDER ID (already correct)
const FOLDER_ID = "1jFLN4paK-CTEEVHHrRuRKtU-ScNiFaUy";

// 👉 Upload to Drive
app.post("/upload", upload.single("file"), async (req, res) => {
    try {
        const fileMetadata = {
            name: req.file.originalname,
            parents: [FOLDER_ID]
        };

        const media = {
            mimeType: req.file.mimetype,
            body: fs.createReadStream(req.file.path)
        };

        await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: "id"
        });

        fs.unlinkSync(req.file.path);

        res.send("Uploaded ✔");
    } catch (err) {
        console.log(err);
        res.send("Upload failed ❌");
    }
});

// 👉 List files from folder
app.get("/files", async (req, res) => {
    try {
        const response = await drive.files.list({
            q: `'${FOLDER_ID}' in parents`,
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
        res.send("Deleted ✔");
    } catch (err) {
        res.send("Delete failed ❌");
    }
});

// 👉 Download file
app.get("/download/:id", (req, res) => {
    res.redirect(`https://drive.google.com/uc?export=download&id=${req.params.id}`);
});

// 👉 Play video
app.get("/video/:id", (req, res) => {
    res.redirect(`https://drive.google.com/uc?export=preview&id=${req.params.id}`);
});

app.listen(PORT, () => console.log("Server running on " + PORT));
