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

  const grouped = {
    board: [],
    projector: [],
    ac: [],
    fan: [],
    table: [],
    chair: [],
  };

  objects.forEach((obj) => {
    if (grouped[obj.type]) {
      grouped[obj.type].push(obj);
    }
  });

  // Pair tables with chairs (table above, chair below)
  const tableChairPairs = [];
  const maxLen = Math.max(grouped.table.length, grouped.chair.length);
  for (let i = 0; i < maxLen; i++) {
    tableChairPairs.push({
      table: grouped.table[i] || null,
      chair: grouped.chair[i] || null,
    });
  }

  const renderGroup = (items, title, gridCols, isPair = false) => {
    if (!items.length) return null;

    return (
      <div className="mb-10">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">{title}</h3>
        <div className={`grid ${gridCols} gap-2 place-items-center`}>
          {!isPair &&
            items.map((obj) => (
              <div
                key={obj._id}
                className="bg-white p-4 rounded-lg shadow w-full max-w-xs text-center"
              >
                <div className="flex flex-col items-center space-y-1">
                  <span className="text-purple-600 font-bold uppercase">{obj.type}</span>
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
                    className="mt-3 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}

          {isPair &&
            items.map(({ table, chair }, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-lg shadow w-full max-w-xs text-center"
              >
                {table && (
                  <div className="mb-2">
                    <div className="text-purple-600 font-bold uppercase">{table.type}</div>
                    <div
                      className="text-blue-600 underline cursor-pointer"
                      onClick={() =>
                        navigate(
                          `/buildings/${buildingId}/floors/${floorId}/rooms/${roomId}/objects/${table._id}/complaints`
                        )
                      }
                    >
                      {table.name}
                    </div>
                    {user?.role === "admin" && (
                      <button
                        onClick={() => handleDeleteObject(table._id)}
                        className="mt-2 bg-red-500 text-white px-2 py-1 rounded text-sm"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
                {chair && (
                  <div className="border-t pt-2 mt-2">
                    <div className="text-purple-600 font-bold uppercase">{chair.type}</div>
                    <div
                      className="text-blue-600 underline cursor-pointer"
                      onClick={() =>
                        navigate(
                          `/buildings/${buildingId}/floors/${floorId}/rooms/${roomId}/objects/${chair._id}/complaints`
                        )
                      }
                    >
                      {chair.name}
                    </div>
                    {user?.role === "admin" && (
                      <button
                        onClick={() => handleDeleteObject(chair._id)}
                        className="mt-2 bg-red-500 text-white px-2 py-1 rounded text-sm"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar user={user} setUser={setUser} />

      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Room Objects</h1>

        {objects.length === 0 ? (
          <p className="text-gray-600 mb-10">No objects found in this room.</p>
        ) : (
          <>
            {renderGroup(grouped.board, "Boards", "grid-cols-1 sm:grid-cols-2 md:grid-cols-1")}
            {renderGroup(grouped.projector, "Projectors", "grid-cols-1 sm:grid-cols-1")}
            {renderGroup(grouped.ac, "ACs", "grid-cols-1 sm:grid-cols-2")}
            {renderGroup(grouped.fan, "Fans", "grid-cols-1 sm:grid-cols-2")}
            {renderGroup(tableChairPairs, "Table & Chair Pairs", "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 xl:grid-cols-12 gap-2", true)}
          </>
        )}

        {user?.role === "admin" && (
          <form
            onSubmit={handleAddObject}
            className="bg-white p-6 rounded-lg shadow space-y-4 mt-4"
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
