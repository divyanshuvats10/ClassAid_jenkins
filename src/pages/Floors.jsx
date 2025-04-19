import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const Floors = () => {
  const { buildingId } = useParams();
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
    e.stopPropagation();

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
    <div className="min-h-screen bg-gray-100">
      <Navbar user={user} setUser={setUser} />

      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Floors in Building</h1>

        <ul className="space-y-4 mb-8">
          {floors.map((floor) => (
            <li
              key={floor._id}
              className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
            >
              <span
                onClick={() =>
                  navigate(`/buildings/${buildingId}/floors/${floor._id}/rooms`)
                }
                className="text-blue-600 font-medium hover:underline cursor-pointer text-lg"
              >
                Floor {floor.floorNumber}
              </span>

              {user?.role === "admin" && (
                <button
                  onClick={(e) => handleDeleteFloor(floor._id, e)}
                  className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                >
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>

        {user?.role === "admin" && (
          <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <h2 className="text-xl font-semibold text-gray-700">Add New Floor</h2>
            <input
              type="number"
              placeholder="New Floor Number"
              value={newFloorNumber}
              onChange={(e) => setNewFloorNumber(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleAddFloor}
              className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              Add Floor
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Floors;
