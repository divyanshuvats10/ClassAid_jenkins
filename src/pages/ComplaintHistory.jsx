import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

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
    fetch(
      `http://localhost:5000/building/${buildingId}/floor/${floorId}/room/${roomId}/objects/${objectId}/complaints`
    )
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
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} setUser={setUser} />

      <div className="max-w-4xl mx-auto px-4 py-10">
        <h2 className="text-3xl font-bold text-purple-700 mb-6">Complaint History</h2>

        {meta && (
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Location Details</h3>
            <p><strong>Block:</strong> {meta.buildingName}</p>
            <p><strong>Floor:</strong> {meta.floorNumber}</p>
            <p><strong>Room:</strong> {meta.roomName}</p>
            <p><strong>Object:</strong> {meta.objectName} ({meta.objectType})</p>
          </div>
        )}

        <div className="space-y-4 mb-10">
          {complaints.map((comp, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-4 border">
              <p><strong>Complaint:</strong> {comp.text}</p>
              <p><strong>Status:</strong> {comp.status}</p>
              <p>
                <strong>Logged:</strong> {new Date(comp.dateLogged).toLocaleString()} by{" "}
                {comp.loggedBy.name} ({comp.loggedBy.registrationNumber})
              </p>

              {comp.status === "pending" && (user?.role === "admin" || user?.role === "worker") && (
                <button
                  onClick={() => handleResolve(comp._id)}
                  className="mt-2 px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Mark as Resolved
                </button>
              )}

              {comp.status === "resolved" && (
                <div className="mt-2 text-sm text-gray-600">
                  <p><strong>Resolved:</strong> {new Date(comp.dateResolved).toLocaleString()}</p>
                  <p>
                    <strong>By:</strong> {comp.resolvedBy.name} ({comp.resolvedBy.registrationNumber})
                  </p>
                </div>
              )}
            </div>
          ))}

          {complaints.length === 0 && (
            <p className="text-center text-gray-500">No complaints found for this object.</p>
          )}
        </div>

        <form onSubmit={handleAddComplaint} className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Log a new complaint</h3>
          <textarea
            value={newComplaint}
            onChange={(e) => setNewComplaint(e.target.value)}
            placeholder="Describe the issue"
            className="w-full border border-gray-300 rounded p-2 mb-4 resize-none"
            rows={4}
            required
          />
          <button
            type="submit"
            className="px-6 py-2 bg-purple-700 text-white rounded hover:bg-purple-800"
          >
            Submit Complaint
          </button>
        </form>
      </div>
    </div>
  );
};

export default ComplaintHistory;
