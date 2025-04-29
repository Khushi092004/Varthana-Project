require("dotenv").config(); 
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const authMiddleware = require("./middlewares/authMiddleware");
const { Message } = require("twilio/lib/twiml/MessagingResponse");

const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:5173",  
  credentials: true
}));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));


app.use("/api/auth", authRoutes);
app.use("/api/admin", authMiddleware,(req, res)=>{
  res.json({ message: `Welcome, ${req.user.coustomerId}`});
}); 

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
