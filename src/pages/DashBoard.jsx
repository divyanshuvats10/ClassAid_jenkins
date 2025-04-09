import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState("pending"); // default filter
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/dashboard", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          if (data.complaints) setComplaints(data.complaints);
        } else {
          navigate("/login");
        }
      })
      .catch((err) => console.error("Session fetch error:", err));
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/logout", { method: "POST", credentials: "include" });
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleViewComplaint = (complaint) => {
    const { buildingId, floorId, roomId, objectId } = complaint;
    navigate(`/buildings/${buildingId}/floors/${floorId}/rooms/${roomId}/objects/${objectId}/complaints`);
  };

  const filteredComplaints =
    filter === "all" ? complaints : complaints.filter((c) => c.status === filter);

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

      {complaints.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h2>Complaints</h2>

          <label>
            Filter:
            <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ marginLeft: "0.5rem" }}>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
              <option value="all">All</option>
            </select>
          </label>

          <ul style={{ marginTop: "1rem" }}>
            {filteredComplaints.map((comp, idx) => (
              <li key={idx} style={{ marginBottom: "1rem" }}>
                <p><strong>Issue:</strong> {comp.text}</p>
                <p><strong>Status:</strong> {comp.status}</p>
                <p><strong>Date:</strong> {new Date(comp.dateLogged).toLocaleString()}</p>
                <button onClick={() => handleViewComplaint(comp)}>View Complaint</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
