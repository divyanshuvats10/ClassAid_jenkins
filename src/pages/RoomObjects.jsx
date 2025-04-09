import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const RoomObjects = () => {
  const { buildingId, floorId, roomId } = useParams();
  const [user, setUser] = useState(null);
  const [objects, setObjects] = useState([]);
  const [newObject, setNewObject] = useState({ name: "", type: "board" });
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/dashboard", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          fetchObjects();
        } else {
          navigate("/login");
        }
      })
      .catch((err) => console.error("Session fetch error:", err));
  }, []);

  const fetchObjects = () => {
    fetch(`http://localhost:5000/building/${buildingId}/floor/${floorId}/room/${roomId}/objects`)
      .then((res) => res.json())
      .then((data) => setObjects(data || [])) // ✅ Handle undefined case
      .catch((err) => console.error("Objects fetch error:", err));
  };

  const handleAddObject = async (e) => {
    e.preventDefault();
    if (!newObject.name) return;

    try {
      const res = await fetch(
        `http://localhost:5000/building/${buildingId}/floor/${floorId}/room/${roomId}/objects`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(newObject),
        }
      );

      if (res.ok) {
        setNewObject({ name: "", type: "board" });
        fetchObjects();
      }
    } catch (error) {
      console.error("Error adding object:", error);
    }
  };

  const handleDeleteObject = async (objectId) => {
    if (!window.confirm("Are you sure you want to delete this object?")) return;
  
    try {
      const res = await fetch(
        `http://localhost:5000/building/${buildingId}/floor/${floorId}/room/${roomId}/objects/${objectId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
  
      if (res.ok) {
        setObjects(objects.filter((obj) => obj._id !== objectId)); // ✅ Remove from state
      } else {
        const data = await res.json();
        console.error("Delete error:", data.message);
      }
    } catch (error) {
      console.error("Error deleting object:", error);
    }
  };
  

  return (
    <div>
      <h1>Room Objects</h1>
  
      {objects.length === 0 ? (
        <p>No objects found in this room.</p> // ✅ Show message if no objects exist
      ) : (
        <ul>
          {objects.map((obj, index) => (
            <li key={index}>
              <strong>{obj.type.toUpperCase()}</strong>: 
              <span 
              style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}
              onClick={() => navigate(`/buildings/${buildingId}/floors/${floorId}/rooms/${roomId}/objects/${obj._id}/complaints`)}
              >
              {obj.name}
              </span>
              {user?.role === "admin" && (
              <button onClick={() => handleDeleteObject(obj._id)}>Delete</button>
            )}
            </li>
          ))}
        </ul>
      )}
  
      {user?.role === "admin" && (
        <form onSubmit={handleAddObject}>
          <input
            type="text"
            placeholder="Object Name"
            value={newObject.name}
            onChange={(e) => setNewObject({ ...newObject, name: e.target.value })}
          />
          <select
            value={newObject.type}
            onChange={(e) => setNewObject({ ...newObject, type: e.target.value })}
          >
            <option value="board">Board</option>
            <option value="projector">Projector</option>
            <option value="ac">AC</option>
            <option value="fan">Fan</option>
            <option value="table">Table</option>
            <option value="chair">Chair</option>
          </select>
          <button type="submit">Add Object</button>
        </form>
      )}
    </div>
  );
  
};

export default RoomObjects;
