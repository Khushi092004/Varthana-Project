import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const OTPInput = ({ customerId, panNumber }) => {
  const navigate = useNavigate();
  const inputs = useRef([]);
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [timer, setTimer] = useState(30);
  const [resending, setResending] = useState(false);
 
 //send OTP whn the component mounts or whn customerId/panNumber change
  useEffect(()=>{
    const sendOtp = async () =>{
    try {
      const response = await axios.post("/api/auth/send-otp",{
        customerId,
        panNumber,
      });
      const expiresIn = response.data.expiresIn || 30;
      setTimer(expiresIn);
    } catch (err) {
      console.error("failed to send otp:", err);
    }
  };
    sendOtp();
  // focus on the first OTP input field
    if (inputs.current[0]){
      inputs.current[0].focus();
    }
  }, [customerId, panNumber]);

  //countdown timer logic 
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => { 
          setTimer(t => t - 1)
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

// handle user typing into OTP inputs
  const handleChange = (val, index) => {
    if (!/^[0-9]?$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);
    if (val && index < 5) { // next input focus automatically
      inputs.current[index + 1].focus();
    }
  };
   

  const handleKeydown=(e,index) => {
    if (e.key ==='Backspace'&& !otp[index] && index >0){
      inputs.current[index-1].focus();
    }
    if (e.key === "ArrowLeft" && index > 0){
      inputs.current[index-1].focus();
    } else if (e.key === "ArrowRight" && index <5) {
      inputs.current[index + 1].focus();
    }
  };

// called for handling verify otp click 
  const handleSubmit = async () => {
    const finalOtp = otp.join('');

    if (finalOtp.length !== 6) {
      alert("Please enter complete OTP");
      return;
    }
    if (timer <= 0) {
      alert("OTP expired. Please resend.");
      return;
    }
    //otp backend verification
    try {
      const res = await axios.get(`http://localhost:5000/api/auth/verify-otp`, {
        params: {
          customerId,
          otp: finalOtp
        }
      });
      //store token 
      localStorage.setItem("token", res.data.token);
      navigate("/admin");
    } catch {
      alert("Invalid OTP");
    }
  };

// resend handler
  const handleResend = async () => {
    setResending(true);
    try {
      const response = await axios.post("http://localhost:5000/api/auth/send-otp", {
        customerId,
        panNumber 
      });
      const expiresIn= response.data.expiresIn || 30;
      setOtp(new Array(6).fill(''));
      setTimer(expiresIn);
    } catch (error) {
      console.error("failed to resend otp :",error);
      alert("failed to resend otp");
    } finally {
      setResending(false);
    }
  };
    

  return (
    <div>
      <h3>Enter OTP</h3>
      <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
        {otp.map((d, i) => (
          <input
            key={i}
            type="text"
            value={d}
            ref={(el) => (inputs.current[i] = el)}
            onChange={(e) => handleChange(e.target.value, i)}
            onKeyDown={(e) => handleKeydown(e,i)}
            maxLength="1"
            style={{ width: "30px", textAlign: "center" }}
          />
        ))}
      </div>
      <div style={{ marginTop: "10px" }}>
        {timer > 0 ? (
          <p> OTP expires in {timer}s</p>
        ) :(
          <button onClick={handleResend} disabled={resending}>
            Resend OTP
          </button>
        )}
        <br />
        <button onClick={handleSubmit}> Verify OTP</button>
      </div>
    </div>
  );
};

export default OTPInput;
