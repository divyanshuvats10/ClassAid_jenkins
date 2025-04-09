import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ComplaintHistory = () => {
  const { buildingId, floorId, roomId, objectId } = useParams();
  const navigate = useNavigate();

  const [meta, setMeta] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [newComplaint, setNewComplaint] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/dashboard", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          fetchComplaints();
        } else {
          navigate("/login");
        }
      })
      .catch((err) => console.error("Session fetch error:", err));
  }, []);

  const fetchComplaints = () => {
    fetch(`http://localhost:5000/building/${buildingId}/floor/${floorId}/room/${roomId}/objects/${objectId}/complaints`)
      .then((res) => res.json())
      .then((data) => {
        setComplaints(data.complaints);
        setMeta(data.meta);
      })
      .catch((err) => console.error("Error fetching complaints:", err));
  };

  const handleAddComplaint = (e) => {
    e.preventDefault();
    fetch("http://localhost:5000/complaints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        objectId,
        buildingId,
        floorId,
        roomId,
        text: newComplaint,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        setNewComplaint("");
        fetchComplaints();
      });
  };

  const handleResolve = (id) => {
    fetch(`http://localhost:5000/complaints/${id}/resolve`, {
      method: "PATCH",
      credentials: "include",
    })
      .then((res) => res.json())
      .then(() => fetchComplaints())
      .catch((err) => console.error("Error resolving complaint:", err));
  };

  return (
    <div>
      <h2>Complaint History</h2>

      {meta && (
        <div style={{ marginBottom: "1rem" }}>
          <h3>Location Details</h3>
          <p><strong>Block:</strong> {meta.buildingName}</p>
          <p><strong>Floor:</strong> {meta.floorNumber}</p>
          <p><strong>Room:</strong> {meta.roomName}</p>
          <p><strong>Object:</strong> {meta.objectName} ({meta.objectType})</p>
        </div>
      )}

      <ul>
        {complaints.map((comp, i) => (
          <li key={i}>
            <p><strong>Complaint:</strong> {comp.text}</p>
            <p><strong>Status:</strong> {comp.status}</p>
            <p>
              <strong>Logged:</strong> {new Date(comp.dateLogged).toLocaleString()} by{" "}
              {comp.loggedBy.name} ({comp.loggedBy.registrationNumber})
            </p>

            {comp.status === "pending" && (user?.role === "admin" || user?.role === "worker") && (
              <button onClick={() => handleResolve(comp._id)}>Mark as Resolved</button>
            )}

            {comp.status === "resolved" && (
              <>
                <p><strong>Resolved:</strong> {new Date(comp.dateResolved).toLocaleString()}</p>
                <p><strong>By:</strong> {comp.resolvedBy.name} ({comp.resolvedBy.registrationNumber})</p>
              </>
            )}
            <hr />
          </li>
        ))}
      </ul>

      <form onSubmit={handleAddComplaint}>
        <textarea
          value={newComplaint}
          onChange={(e) => setNewComplaint(e.target.value)}
          placeholder="Describe the issue"
        />
        <button type="submit">Submit Complaint</button>
      </form>
    </div>
  );
};

export default ComplaintHistory;
