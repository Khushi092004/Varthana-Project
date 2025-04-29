const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  customerId: { type: String, required: true, unique: true },
  panNumber: { type: String, required: true },
  session_otp: String,
  otp_expiry: Date,
  jwt_token: String,
});

module.exports = mongoose.model("User", userSchema);
