import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

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
      .then((data) => setObjects(data || []))
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
        setObjects(objects.filter((obj) => obj._id !== objectId));
      } else {
        const data = await res.json();
        console.error("Delete error:", data.message);
      }
    } catch (error) {
      console.error("Error deleting object:", error);
    }
  };

  // Custom sorting logic
  const sortObjects = (objList) => {
    const order = { board: 1, projector: 2, ac: 3, fan: 4, table: 5, chair: 6 };
    const sorted = [...objList].sort((a, b) => {
      const typeOrder = order[a.type] - order[b.type];
      return typeOrder !== 0 ? typeOrder : a.name.localeCompare(b.name);
    });

    // Pair table and chair by number
    const pairs = [];
    const others = sorted.filter(obj => !['table', 'chair'].includes(obj.type));
    const tables = sorted.filter(obj => obj.type === 'table');
    const chairs = sorted.filter(obj => obj.type === 'chair');

    for (let i = 0; i < Math.max(tables.length, chairs.length); i++) {
      if (tables[i]) pairs.push(tables[i]);
      if (chairs[i]) pairs.push(chairs[i]);
    }

    return [...others, ...pairs];
  };

  const sortedObjects = sortObjects(objects);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar user={user} setUser={setUser} />

      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Room Objects</h1>

        {sortedObjects.length === 0 ? (
          <p className="text-gray-600">No objects found in this room.</p>
        ) : (
          <ul className="space-y-4 mb-8">
            {sortedObjects.map((obj) => (
              <li
                key={obj._id}
                className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
              >
                <div className="flex gap-2 items-center">
                  <span className="font-semibold uppercase text-purple-600">
                    {obj.type}
                  </span>
                  <span
                    className="text-blue-600 underline cursor-pointer"
                    onClick={() =>
                      navigate(
                        `/buildings/${buildingId}/floors/${floorId}/rooms/${roomId}/objects/${obj._id}/complaints`
                      )
                    }
                  >
                    {obj.name}
                  </span>
                </div>
                {user?.role === "admin" && (
                  <button
                    onClick={() => handleDeleteObject(obj._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        {user?.role === "admin" && (
          <form
            onSubmit={handleAddObject}
            className="bg-white p-6 rounded-lg shadow space-y-4"
          >
            <h2 className="text-xl font-semibold text-gray-700">Add New Object</h2>
            <input
              type="text"
              placeholder="Object Name"
              value={newObject.name}
              onChange={(e) =>
                setNewObject({ ...newObject, name: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <select
              value={newObject.type}
              onChange={(e) =>
                setNewObject({ ...newObject, type: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="board">Board</option>
              <option value="projector">Projector</option>
              <option value="ac">AC</option>
              <option value="fan">Fan</option>
              <option value="table">Table</option>
              <option value="chair">Chair</option>
            </select>
            <button
              type="submit"
              className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              Add Object
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default RoomObjects;
