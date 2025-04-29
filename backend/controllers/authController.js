const User = require("../models/User");
const jwt = require("jsonwebtoken");
const {SECRET_KEY} = require("../config");
const twilio = require("twilio");

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

exports.sendOTP = async (req, res) => {
  const { customerId, panNumber } = req.body;

  try {
    const user = await User.findOne({ customerId, panNumber });
    console.log("Incoming Request:", customerId, panNumber);
    
    if (!user) return res.status(404).json({ error: "User not found" });

    const otp = generateOTP();
    const expiry = new Date(Date.now() + 5 * 60 * 1000);
    const token = jwt.sign({ customerId }, SECRET_KEY, { expiresIn: "1h" });

    user.session_otp = otp;
    user.otp_expiry = expiry;
    user.jwt_token = token;
    await user.save();

    console.log(`OTP sent to ${customerId}: ${otp}`);
    res.json({ message: "OTP sent", token : token, expiresIn: 300 });
  } catch (err) {
    console.error("send otp error:",err)
    res.status(500).json({ error: "Server error" });
  }
};


exports.verifyOTP = async (req, res) => {
  const { customerId, otp } = req.query;
  try {
    
    const user = await User.findOne({ customerId });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.session_otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (new Date() > user.otp_expiry) {
      return res.status(400).json({ message: "OTP expired" });
    }
 
    user.session_otp = null;
    user.otp_expiry = null;
    await user.save();
    
    res.json({ token : user.jwt_token });
  } catch (err) {
    console.error("Error in verifyOTP:", err); 
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};
