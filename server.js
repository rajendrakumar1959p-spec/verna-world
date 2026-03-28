const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

let files = [];

// Upload
app.post("/upload", upload.single("file"), (req, res) => {
    const file = {
        id: req.file.filename,
        name: req.file.originalname
    };
    files.push(file);
    res.send("Uploaded");
});

// Get files
app.get("/files", (req, res) => {
    res.json(files);
});

// Stream video
app.get("/video/:id", (req, res) => {
    const filePath = path.join(__dirname, "uploads", req.params.id);
    res.sendFile(filePath);
});

// Download
app.get("/download/:id", (req, res) => {
    const filePath = path.join(__dirname, "uploads", req.params.id);
    res.download(filePath);
});

// Delete
app.delete("/delete/:id", (req, res) => {
    const id = req.params.id;

    files = files.filter(f => f.id !== id);

    fs.unlinkSync(path.join("uploads", id));

    res.send("Deleted");
});

app.listen(3000, () => console.log("Server running on port 3000"));
