const express = require("express");
const { sendOTP, verifyOTP } = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/send-otp", sendOTP);
router.get("/verify-otp", verifyOTP);
router.get("/protected", authMiddleware, (req, res) => {
  res.json({ message: `Welcome user ${req.user.id}` });
});

router.get("/admin", authMiddleware, (req, res) => {
  res.json({ message: "Welcome to Admin Dashboard", user: req.user });
});
module.exports = router;
