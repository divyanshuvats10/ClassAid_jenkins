import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const Rooms = () => {
  const { buildingId, floorId } = useParams();
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
      const res = await fetch(
        `http://localhost:5000/buildings/${buildingId}/floors/${floorId}/rooms`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ roomName: newRoomName }),
        }
      );

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
      const res = await fetch(
        `http://localhost:5000/buildings/${buildingId}/floors/${floorId}/rooms/${roomId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (res.ok) {
        fetchRooms();
      }
    } catch (error) {
      console.error("Error deleting room:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar user={user} setUser={setUser} />

      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Rooms on Floor</h1>

        <ul className="space-y-4 mb-8">
          {rooms.map((room) => (
            <li
              key={room._id}
              className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
            >
              <span
                onClick={() =>
                  navigate(
                    `/buildings/${buildingId}/floors/${floorId}/rooms/${room._id}/objects`
                  )
                }
                className="text-blue-600 font-medium hover:underline cursor-pointer text-lg"
              >
                {room.roomName}
              </span>

              {user?.role === "admin" && (
                <button
                  onClick={() => handleDeleteRoom(room._id)}
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
            <h2 className="text-xl font-semibold text-gray-700">Add New Room</h2>
            <input
              type="text"
              placeholder="New Room Name"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleAddRoom}
              className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              Add Room
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rooms;
