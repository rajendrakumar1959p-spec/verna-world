const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// 📁 Upload folder
const upload = multer({ dest: "uploads/" });

// 🔐 Login credentials
const USER = {
    username: "admin",
    password: "1234"
};

// 👉 Root → login page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

// 👉 Login check
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (username === USER.username && password === USER.password) {
        res.redirect("/dashboard.html");
    } else {
        res.send("❌ Invalid Login");
    }
});

// 👉 Upload file
app.post("/upload", upload.single("file"), (req, res) => {
    const oldPath = req.file.path;
    const newPath = "uploads/" + req.file.originalname;

    fs.rename(oldPath, newPath, (err) => {
        if (err) throw err;
        res.send("Uploaded ✔");
    });
});

// 👉 List files
app.get("/files", (req, res) => {
    fs.readdir("uploads", (err, files) => {
        if (err) return res.json([]);

        const fileList = files.map(file => ({
            name: file
        }));

        res.json(fileList);
    });
});

// 👉 Download file
app.get("/download/:name", (req, res) => {
    const filePath = path.join(__dirname, "uploads", req.params.name);
    res.download(filePath);
});

// 👉 Play video
app.get("/video/:name", (req, res) => {
    const filePath = path.join(__dirname, "uploads", req.params.name);
    res.sendFile(filePath);
});

// 👉 Delete file
app.delete("/delete/:name", (req, res) => {
    const filePath = path.join(__dirname, "uploads", req.params.name);

    fs.unlink(filePath, (err) => {
        if (err) return res.send("Delete failed ❌");
        res.send("Deleted ✔");
    });
});

// Start server
app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
