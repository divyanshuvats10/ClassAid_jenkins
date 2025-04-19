import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState("pending");
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
      await fetch("http://localhost:5000/logout", {
        method: "POST",
        credentials: "include",
      });
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleViewComplaint = (complaint) => {
    const { buildingId, floorId, roomId, objectId } = complaint;
    navigate(
      `/buildings/${buildingId}/floors/${floorId}/rooms/${roomId}/objects/${objectId}/complaints`
    );
  };

  const filteredComplaints =
    filter === "all"
      ? complaints
      : complaints.filter((c) => c.status === filter);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar user={user} setUser={setUser} />

      <div className="max-w-5xl mx-auto py-10 px-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

        {user ? (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-purple-700">User Info</h2>
            <p><strong>Registration Number:</strong> {user.registration_number}</p>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Role:</strong> {user.role}</p>
          </div>
        ) : (
          <p className="text-gray-600">Loading user details...</p>
        )}

        <div className="mb-6">
          <button
            onClick={() => navigate("/buildings")}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            Go to Blocks
          </button>
        </div>

        {complaints.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-purple-700">Complaints</h2>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Filter:</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1 focus:ring-purple-500 focus:outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="resolved">Resolved</option>
                  <option value="all">All</option>
                </select>
              </div>
            </div>

            <ul className="space-y-4">
              {filteredComplaints.map((comp, idx) => (
                <li
                  key={idx}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <p><strong>Issue:</strong> {comp.text}</p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={`px-2 py-0.5 rounded-full text-sm font-medium ${
                        comp.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {comp.status}
                    </span>
                  </p>
                  <p><strong>Date:</strong> {new Date(comp.dateLogged).toLocaleString()}</p>
                  <button
                    onClick={() => handleViewComplaint(comp)}
                    className="mt-3 text-sm bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700"
                  >
                    View Complaint
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
