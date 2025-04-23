import React, { useState } from 'react';
import axios from 'axios';
import OTPInput from './OTPinput';

const LoginForm = () => {
  const [customerId, setCustomerId] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [otpPhase, setOtpPhase] = useState(false);

  const handleSendOTP = async () => {
    if (!customerId || !panNumber.match(/[A-Z]{5}[0-9]{4}[A-Z]{1}/)) {
      alert('Enter valid Customer ID and PAN number');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/auth/send-otp', {
        customerId,
        panNumber,
      });
      setOtpPhase(true);
    } catch {
      alert('Error sending OTP');
    }
  };

  return (
    <div className="form-container">
      {!otpPhase ? (
        <div>
          <h2>Login</h2>
          <input placeholder="Customer ID" value={customerId} onChange={(e) => setCustomerId(e.target.value)} />
          <input placeholder="PAN Number" value={panNumber} onChange={(e) => setPanNumber(e.target.value.toUpperCase())} />
          <button onClick={handleSendOTP}>Send OTP</button>
        </div>
      ) : (
        <OTPInput customerId={customerId} />
      )}
    </div>
  );
};

export default LoginForm;
