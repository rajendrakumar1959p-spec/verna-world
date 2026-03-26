const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// Login
const USER = {
    username: "admin",
    password: "1234"
};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

// Upload setup
const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage });

// Root fix
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Login
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (username === USER.username && password === USER.password) {
        res.redirect("/dashboard.html");
    } else {
        res.send("Login Failed");
    }
});

// Upload
app.post("/upload", upload.single("file"), (req, res) => {
    res.send("Uploaded");
});

// Get files
app.get("/files", (req, res) => {
    fs.readdir("uploads", (err, files) => {
        if (err) return res.json([]);
        res.json(files);
    });
});

// Delete
app.delete("/delete/:name", (req, res) => {
    const filePath = path.join(__dirname, "uploads", req.params.name);

    fs.unlink(filePath, (err) => {
        if (err) return res.send("Error deleting");
        res.send("Deleted");
    });
});

// Download
app.get("/download/:name", (req, res) => {
    const filePath = path.join(__dirname, "uploads", req.params.name);
    res.download(filePath);
});

// Video streaming
app.get("/video/:name", (req, res) => {
    const filePath = path.join(__dirname, "uploads", req.params.name);

    if (!fs.existsSync(filePath)) {
        return res.status(404).send("File not found");
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = Number(parts[0]);
        const end = parts[1] ? Number(parts[1]) : fileSize - 1;

        const chunkSize = end - start + 1;
        const file = fs.createReadStream(filePath, { start, end });

        res.writeHead(206, {
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": chunkSize,
            "Content-Type": "video/mp4"
        });

        file.pipe(res);
    } else {
        res.writeHead(200, {
            "Content-Length": fileSize,
            "Content-Type": "video/mp4"
        });

        fs.createReadStream(filePath).pipe(res);
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
