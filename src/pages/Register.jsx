import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    registration_number: "",
    name: "",
    password: "",
    role: "student",
  });

  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    fetch("http://localhost:5000/register", { credentials: "include" })
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
      const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const data = await response.json();
      if (response.ok) {
        alert("Registration Successful!");
        navigate("/dashboard"); // Redirect to dashboard after registration
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
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" name="registration_number" placeholder="Registration Number" required onChange={handleChange} />
        <input type="text" name="name" placeholder="Full Name" required onChange={handleChange} />
        <input type="password" name="password" placeholder="Password" required onChange={handleChange} />
        <select name="role" onChange={handleChange}>
          <option value="student">Student (Default)</option>
          <option value="worker">Worker</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
