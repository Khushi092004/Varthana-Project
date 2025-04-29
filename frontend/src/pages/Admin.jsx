import React, { useEffect, } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = sessionStorage.getItem("token");
        await axios.get("http://localhost:5000/api/auth/admin", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
      } catch (err) {
        console.error("Unauthorized access or server error:", err);
        alert("Session expired. Please login again.");
        sessionStorage.removeItem("token");
        navigate("/");
      }
    };

    fetchAdminData();
  }, [navigate]);

  return (
    <div>
      <h2>Admin Dashboard</h2>
      
    </div>
  );
};

export default Admin;
