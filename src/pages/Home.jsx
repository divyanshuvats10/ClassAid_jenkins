import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const Home = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-gray-100">
      <Navbar user={user} setUser={setUser} />

      <div className="max-w-3xl mx-auto text-center px-4 py-20">
        <h1 className="text-4xl font-bold text-purple-700 mb-4">
          Welcome to the Docker
        </h1>

        {user ? (
          <h2 className="text-lg text-gray-700">
            Hello, <span className="font-semibold">{user.name}</span> ({user.role})
          </h2>
        ) : (
          <p className="text-gray-600">
            Please{" "}
            <span
              className="text-blue-600 underline cursor-pointer"
              onClick={() => navigate("/login")}
            >
              login
            </span>{" "}
            or{" "}
            <span
              className="text-blue-600 underline cursor-pointer"
              onClick={() => navigate("/register")}
            >
              register
            </span>{" "}
            to get started.
          </p>
        )}
      </div>
    </div>
  );
};

export default Home;
