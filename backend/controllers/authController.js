const User = require("../models/User");
const jwt = require("jsonwebtoken");
const twilio = require("twilio");

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

exports.sendOTP = async (req, res) => {
    console.log("Twilio From:", process.env.TWILIO_PHONE);
    console.log("Twilio To:", process.env.DEFAULT_PHONE);
  try {
    const { customerId, panNumber } = req.body;
    console.log("Received customerId:", customerId);

    let user = await User.findOne({ customerId });
    console.log("User found:", user);

    if (!user) {
      user = new User({ customerId, panNumber });
    }

    const otp = generateOTP();
    user.session_otp = otp;
    user.otp_expiry = new Date(Date.now() + 30 * 1000);

    await user.save();
    console.log("User saved with OTP");

    await client.messages.create({
      body: `Your OTP is: ${otp}`,
      from: process.env.TWILIO_PHONE,
      to: process.env.DEFAULT_PHONE
    });

    res.json({ message: "OTP sent" , expiresIn: 30});
  } catch (err) {
    console.error("Error in sendOTP:", err); // Log the error
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { customerId, otp } = req.query;
    const user = await User.findOne({ customerId });

    if (!user || user.session_otp !== otp || new Date() > user.otp_expiry) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    user.session_otp = null;
    user.otp_expiry = null;
    await user.save();
    
    res.json({ token });
  } catch (err) {
    console.error("Error in verifyOTP:", err); // Log the error
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};
