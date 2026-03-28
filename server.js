const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

// ✅ Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // 🔥 SERVES HTML FILES

// ✅ Multer setup
const upload = multer({ dest: "uploads/" });

// ✅ Memory storage (temporary)
let files = [];

// ✅ Upload API
app.post("/upload", upload.single("file"), (req, res) => {
    const file = {
        id: req.file.filename,
        name: req.file.originalname
    };

    files.push(file);

    res.send("Uploaded");
});

// ✅ Get files
app.get("/files", (req, res) => {
    res.json(files);
});

// ✅ Stream video
app.get("/video/:id", (req, res) => {
    const filePath = path.join(__dirname, "uploads", req.params.id);

    if (!fs.existsSync(filePath)) {
        return res.status(404).send("File not found");
    }

    res.sendFile(filePath);
});

// ✅ Download
app.get("/download/:id", (req, res) => {
    const filePath = path.join(__dirname, "uploads", req.params.id);

    if (!fs.existsSync(filePath)) {
        return res.status(404).send("File not found");
    }

    res.download(filePath);
});

// ✅ Delete
app.delete("/delete/:id", (req, res) => {
    const id = req.params.id;

    files = files.filter(f => f.id !== id);

    const filePath = path.join("uploads", id);

    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }

    res.send("Deleted");
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
