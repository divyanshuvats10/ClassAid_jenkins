import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Home = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Check session on page load
  useEffect(() => {
    fetch("http://localhost:5000/session", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch((err) => console.error("Session check failed:", err));
  }, []);

  // Logout function
  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:5000/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        setUser(null);
        navigate("/");
      } else {
        alert("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div>
      {/* Navbar */}
      <nav>
        <h2>Complaint Management</h2>
        <div>
          {user ? (
            <button onClick={handleLogout}>Logout</button>
          ) : (
            <>
              <Link to="/register">Register</Link>
              <Link to="/login">Login</Link>
            </>
          )}
        </div>
      </nav>

      {/* Welcome Message */}
      <h1 className="text-red-500">Welcome to the Complaint Management System</h1>
      {user && <h2>Hello, {user.name} ({user.role})</h2>}
    </div>
  );
};

export default Home;
