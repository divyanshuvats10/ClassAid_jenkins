import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const Floors = () => {
  const { buildingId } = useParams(); // Building ID
  const [user, setUser] = useState(null);
  const [floors, setFloors] = useState([]);
  const [newFloorNumber, setNewFloorNumber] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/dashboard", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          fetchFloors();
        } else {
          navigate("/login");
        }
      });
  }, []);

  const fetchFloors = () => {
    fetch(`http://localhost:5000/buildings/${buildingId}/floors`)
      .then((res) => res.json())
      .then((data) => setFloors(data))
      .catch((err) => console.error("Floors fetch error:", err));
  };

  const handleAddFloor = async () => {
    if (!newFloorNumber || isNaN(newFloorNumber)) {
      alert("Please enter a valid floor number.");
      return;
    }

    if (floors.some((floor) => floor.floorNumber === Number(newFloorNumber))) {
      alert("Floor number already exists.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/buildings/${buildingId}/floors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ floorNumber: Number(newFloorNumber) }),
      });

      if (res.ok) {
        setNewFloorNumber("");
        fetchFloors();
      }
    } catch (error) {
      console.error("Error adding floor:", error);
    }
  };

  const handleDeleteFloor = async (floorId, e) => {
    e.stopPropagation(); // Prevents clicking delete from triggering navigation

    try {
      const res = await fetch(`http://localhost:5000/buildings/${buildingId}/floors/${floorId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        fetchFloors();
      }
    } catch (error) {
      console.error("Error deleting floor:", error);
    }
  };

  return (
    <div>
      <h1>Floors in Building</h1>
      <ul>
        {floors.map((floor) => (
          <li key={floor._id}>
            <span 
              style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}
              onClick={() => navigate(`/buildings/${buildingId}/floors/${floor._id}/rooms`)}
            >
            Floor {floor.floorNumber}
            </span>
            {user?.role === "admin" && (
              <button onClick={(e) => handleDeleteFloor(floor._id, e)}>Delete</button>
            )}
          </li>
        ))}
      </ul>

      {user?.role === "admin" && (
        <div>
          <input
            type="number"
            placeholder="New Floor Number"
            value={newFloorNumber}
            onChange={(e) => setNewFloorNumber(e.target.value)}
          />
          <button onClick={handleAddFloor}>Add Floor</button>
        </div>
      )}
    </div>
  );
};

export default Floors;
