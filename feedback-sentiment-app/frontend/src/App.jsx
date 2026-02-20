import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import FeedbackForm from './components/FeedbackForm';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(false);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/signin" />} />
          
          <Route path="/signup" element={<SignUp />} />
          
          <Route 
            path="/signin" 
            element={<SignIn setUser={setUser} />} 
          />
          
          <Route 
            path="/feedback" 
            element={
              user ? <FeedbackForm user={user} /> : <Navigate to="/signin" />
            } 
          />
          
          <Route path="/admin" element={<AdminLogin setAdmin={setAdmin} />} />
          
          <Route 
            path="/admin/dashboard" 
            element={
              admin ? <AdminDashboard /> : <Navigate to="/admin" />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
