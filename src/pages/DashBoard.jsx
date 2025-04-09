import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user session data
    fetch("http://localhost:5000/dashboard", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        } else {
          navigate("/login"); // Redirect if not logged in
        }
      })
      .catch((err) => console.error("Session fetch error:", err));
  }, []);

 

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/logout", { method: "POST", credentials: "include" });
      navigate("/"); // Redirect to home after logout
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };


  return (
    <div>
      <nav>
        {user ? (
          <>
            <span>Welcome, {user.name} ({user.role})</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <a href="/register">Register</a>
            <a href="/login">Login</a>
          </>
        )}
      </nav>

      <h1>Dashboard</h1>
      {user ? (
        <div>
          <p><strong>Registration Number:</strong> {user.registration_number}</p>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Role:</strong> {user.role}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}

    <button onClick={() => navigate("/buildings")}>Blocks</button>

      
    </div>
  );
};

export default Dashboard;
