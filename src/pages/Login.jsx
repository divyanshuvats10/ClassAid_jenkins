import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({
    registration_number: "",
    name: "",
    password: "",
  });
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    fetch("http://localhost:5000/login", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.redirect) {
          navigate(data.redirect); // Redirect to dashboard if already logged in
        }
      })
      .catch((err) => console.error("Session check failed:", err));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Login Successful!");
        console.log("User:", data.user);
        navigate("/dashboard"); // Redirect to dashboard after login
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong.");
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="registration_number"
          placeholder="Registration Number"
          required
          onChange={handleChange}
        />
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          required
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          onChange={handleChange}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
