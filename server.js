const express = require("express");
const app = express();

// Middleware (optional but useful)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Home route
app.get("/", (req, res) => {
  res.send("🚀 Server is running successfully on Render!");
});

// Example API route
app.get("/api", (req, res) => {
  res.json({
    message: "API is working properly ✅",
  });
});

// IMPORTANT: Use Render PORT
const PORT = process.env.PORT || 10000;

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
