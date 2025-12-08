import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { LoginPage } from './components/pages/LoginPage';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import type { User } from './components/utils/Users';
import { Profile } from "./components/pages/Profile";

export default function App () {
  const [currentUser, setCurrentUser] = useState<User |null>(null);

  const handleLogin = (user: User) => {
    console.log(user)
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("refresh")
    const accessToken = localStorage.getItem("access")
    try {
      const response = await fetch("http://127.0.0.1:8000/api/logout/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({ refresh_token : refreshToken}),
      });

      const logoutData = await response.json();
      console.log(logoutData)
      if (!response.ok) {
        // toast.error(data.detail || "Invalid email or password");
        // setIsLoading(false);
        console.log("Logout request failed")
        return;
      }

      localStorage.removeItem("access");
      localStorage.removeItem("refresh");

      toast.success("Logged Out Successfully")
      setCurrentUser(null);
      //navigate(`/login`);

    } catch (error) {
      toast.error("Server unreachable. Try again later.");
    }
  };

  return (
    <Router>
      <Routes>

        <Route path="/login" element={ <LoginPage onLogin={handleLogin}/>} />

        <Route 
          path="/profile"
          element={
            currentUser ? 
            ( <Profile user={currentUser} onLogout={handleLogout} /> ) : 
            ( <Navigate to="/login"/> )
          }
        />

        <Route path="*" element={<Navigate to="/login" />} />

      </Routes>
      <Toaster />
    </Router>
  )

}