import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const Rooms = () => {
  const { buildingId,floorId } = useParams(); // Floor ID
  const [user, setUser] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/dashboard", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          fetchRooms();
        } else {
          navigate("/login");
        }
      });
  }, []);

  const fetchRooms = () => {
    fetch(`http://localhost:5000/buildings/${buildingId}/floors/${floorId}/rooms`)
      .then((res) => res.json())
      .then((data) => setRooms(data))
      .catch((err) => console.error("Rooms fetch error:", err));
  };

  const handleAddRoom = async () => {
    if (!newRoomName) return;

    try {
      const res = await fetch(`http://localhost:5000/buildings/${buildingId}/floors/${floorId}/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ roomName: newRoomName }),
      });

      if (res.ok) {
        setNewRoomName("");
        fetchRooms();
      }
    } catch (error) {
      console.error("Error adding room:", error);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    try {
      const res = await fetch(`http://localhost:5000/buildings/${buildingId}/floors/${floorId}/rooms/${roomId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        fetchRooms();
      }
    } catch (error) {
      console.error("Error deleting room:", error);
    }
  };

  return (
    <div>
      <h1>Rooms on Floor</h1>
      <ul>
        {rooms.map((room) => (
          <li key={room._id}>
            <span 
              style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}
              onClick={() => navigate(`/buildings/${buildingId}/floors/${floorId}/rooms/${room._id}/objects`)}
            >
            {room.roomName}
            </span>
            {user?.role === "admin" && (
              <button onClick={() => handleDeleteRoom(room._id)}>Delete</button>
            )}
          </li>
        ))}
      </ul>

      {user?.role === "admin" && (
        <div>
          <input
            type="text"
            placeholder="New Room Name"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
          />
          <button onClick={handleAddRoom}>Add Room</button>
        </div>
      )}
    </div>
  );
};

export default Rooms;
