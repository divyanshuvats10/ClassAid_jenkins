import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const Buildings = () => {
  const [user, setUser] = useState(null);
  const [buildings, setBuildings] = useState([]);
  const [newBuildingName, setNewBuildingName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/dashboard", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          fetchBuildings();
        } else {
          navigate("/login");
        }
      })
      .catch((err) => console.error("Session fetch error:", err));
  }, []);

  const fetchBuildings = () => {
    fetch("http://localhost:5000/building")
      .then((res) => res.json())
      .then((data) => setBuildings(data))
      .catch((err) => console.error("Buildings fetch error:", err));
  };

  const handleAddBuilding = async (e) => {
    e.preventDefault();
    if (!newBuildingName) return;

    try {
      const res = await fetch("http://localhost:5000/building", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ buildingName: newBuildingName }),
      });

      if (res.ok) {
        setNewBuildingName("");
        fetchBuildings();
      }
    } catch (error) {
      console.error("Error adding building:", error);
    }
  };

  const handleDeleteBuilding = async (buildingId) => {
    if (!window.confirm("Are you sure you want to delete this building?")) return;

    try {
      const res = await fetch(`http://localhost:5000/building/${buildingId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        fetchBuildings();
      } else {
        const data = await res.json();
        console.error("Delete failed:", data.message);
      }
    } catch (error) {
      console.error("Error deleting building:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar user={user} setUser={setUser} />

      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Buildings</h1>

        <ul className="space-y-4 mb-8">
          {buildings.map((building) => (
            <li
              key={building._id}
              className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
            >
              <span
                onClick={() => navigate(`/buildings/${building._id}/floors`)}
                className="text-blue-600 font-medium hover:underline cursor-pointer text-lg"
              >
                {building.buildingName}
              </span>

              {user?.role === "admin" && (
                <button
                  onClick={() => handleDeleteBuilding(building._id)}
                  className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                >
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>

        {user?.role === "admin" && (
          <form
            onSubmit={handleAddBuilding}
            className="bg-white p-6 rounded-lg shadow space-y-4"
          >
            <h2 className="text-xl font-semibold text-gray-700">Add New Building</h2>
            <input
              type="text"
              placeholder="New Building Name"
              value={newBuildingName}
              onChange={(e) => setNewBuildingName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              Add Building
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Buildings;
