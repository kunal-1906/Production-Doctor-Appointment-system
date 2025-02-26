
require("dotenv").config();
console.log("JWT Secret:", process.env.JWT_SECRET);

// Load environment variables at the very top

const express = require("express");
const colors = require("colors");
const morgan = require("morgan");
const connectDB = require("./config/db");

// ✅ Debugging step: Print all environment variables
process.env.MONGO_URL = "mongodb+srv://kvig_be22:Kunaldpk19@cluster0.r64k6.mongodb.net/doctorapp";
connectDB();


const app = express();
app.use(express.json());
app.use(morgan("dev"));

app.use('/api/v1/user',require("./routes/userRoutes"));
app.use('/api/v1/admin',require('./routes/adminRoutes'));
app.use('/api/v1/doctor',require ('./routes/doctorRoutes'));


const port = process.env.PORT || 8080;
const mode = process.env.NODE_MODE || "development";


app.listen(port, () => {
  console.log(`Server running in ${mode} MODE ON PORT ${port}`.bgCyan.white);
});

app.get("/", (req, res) => {
    res.send("API is running...");
});

const path = require("path");

// Serve React frontend
app.use(express.static(path.join(__dirname, "client", "build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

