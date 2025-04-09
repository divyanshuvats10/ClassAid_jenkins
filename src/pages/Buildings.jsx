import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Buildings = () => {
  const [user, setUser] = useState(null);
  const [buildings, setBuildings] = useState([]);
  const [newBuildingName, setNewBuildingName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user session data
    fetch("http://localhost:5000/dashboard", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          fetchBuildings(); // Fetch buildings if logged in
        } else {
          navigate("/login"); // Redirect if not logged in
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
    <div>
      <h1>Buildings</h1>
      <ul>
        {buildings.map((building) => (
          <li key={building._id}>
            <span 
              style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}
              onClick={() => navigate(`/buildings/${building._id}/floors`)}
            >
              {building.buildingName}
            </span>
            {user?.role === "admin" && (
              <button onClick={() => handleDeleteBuilding(building._id)}>Delete</button>
            )}
          </li>
        ))}
      </ul>

      {user?.role === "admin" && (
        <form onSubmit={handleAddBuilding}>
          <input
            type="text"
            placeholder="New Building Name"
            value={newBuildingName}
            onChange={(e) => setNewBuildingName(e.target.value)}
          />
          <button type="submit">Add Building</button>
        </form>
      )}
    </div>
  );
};

export default Buildings;
