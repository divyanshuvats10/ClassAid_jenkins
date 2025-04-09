import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/DashBoard";
import Buildings from "./pages/Buildings";
import Floors from "./pages/Floors";
import Rooms from "./pages/Rooms";
import RoomObjects from "./pages/RoomObjects";
import ComplaintHistory from "./pages/ComplaintHistory";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buildings"
        element={
          <ProtectedRoute>
            <Buildings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buildings/:buildingId/floors"
        element={
          <ProtectedRoute>
            <Floors />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buildings/:buildingId/floors/:floorId/rooms"
        element={
          <ProtectedRoute>
            <Rooms />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buildings/:buildingId/floors/:floorId/rooms/:roomId/objects"
        element={
          <ProtectedRoute>
            <RoomObjects />
          </ProtectedRoute>
        }
      />
        <Route
        path="/buildings/:buildingId/floors/:floorId/rooms/:roomId/objects/:objectId/complaints"
        element={
          <ProtectedRoute>
            <ComplaintHistory />
          </ProtectedRoute>
        }
      />
      
    </Routes>
  );
};

export default App;
