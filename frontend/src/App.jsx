import React, { Children } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import Admin from './pages/Admin';
import {jwtDecode} from 'jwt-decode';

const PrivateRoute = ({ children }) => {
  const token = sessionStorage.getItem("token");
  
  if (!token) return <Navigate to="/"/>
  try {
    const decoded = jwtDecode(token);
    if (decoded.exp * 1000 <Date.now()){
      sessionStorage.removeItem("token");
      return <Navigate to="/"/>;
    }
    return children;
  } catch  {
    return <Navigate to="/"/>;
  };

};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route 
          path="/admin" 
          element= {
          <PrivateRoute>
            <Admin/>
          </PrivateRoute> 
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
