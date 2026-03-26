const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const { google } = require("googleapis");

const app = express();
const PORT = process.env.PORT || 3000;

// 🔥 YOUR DRIVE FOLDER ID
const FOLDER_ID = "1jFLN4paK-CTEEVHHrRuRKtU-ScNiFaUy";

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// 🔐 Auth
const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: ["https://www.googleapis.com/auth/drive"]
});

const drive = google.drive({ version: "v3", auth });

// 🔐 Login
const USER = {
    username: "admin",
    password: "1234"
};

// Root
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Login
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (username === USER.username && password === USER.password) {
        res.redirect("/dashboard.html");
    } else {
        res.send("❌ Invalid Login");
    }
});

// 📤 Upload (Drive)
const upload = multer({ dest: "temp/" });

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

        const file = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: "id"
        });

        // make public
        await drive.permissions.create({
            fileId: file.data.id,
            requestBody: {
                role: "reader",
                type: "anyone"
            }
        });

        fs.unlinkSync(req.file.path);

        res.send("Uploaded ✔");
    } catch (err) {
        console.log(err);
        res.send("Upload failed ❌");
    }
});

// 📂 List files
app.get("/files", async (req, res) => {
    try {
        const response = await drive.files.list({
            q: `'${FOLDER_ID}' in parents`,
            fields: "files(id, name)"
        });

        res.json(response.data.files);
    } catch (err) {
        res.json([]);
    }
});

// ▶ Play
app.get("/video/:id", (req, res) => {
    res.redirect(`https://drive.google.com/uc?export=preview&id=${req.params.id}`);
});

// ⬇ Download
app.get("/download/:id", (req, res) => {
    res.redirect(`https://drive.google.com/uc?export=download&id=${req.params.id}`);
});

// 🗑 Delete
app.delete("/delete/:id", async (req, res) => {
    try {
        await drive.files.delete({ fileId: req.params.id });
        res.send("Deleted ✔");
    } catch (err) {
        res.send("Delete failed ❌");
    }
});

app.listen(PORT, () => console.log("Server running on " + PORT));
