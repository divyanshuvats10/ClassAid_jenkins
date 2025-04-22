require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const User = require("./models/User"); // Import User model
const Building = require("./models/Layout"); // Import Building model
const Complaint = require("./models/Complaint");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// MongoDB Connection
mongoose
  .connect("mongodb://mongo:27017/classaid", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Express Session
app.use(
  session({
    secret: "supersecretkey",
    resave: false,
    saveUninitialized: false, // Prevents empty sessions
    cookie: { httpOnly: true, secure: false, sameSite: "lax" },
  })
);

// Test Route
app.get("/", (req, res) => res.send("Backend is running..."));

// Session Check Route
app.get("/session", (req, res) => {
  res.json({ user: req.session.user || null });
});

// Redirect logged-in users trying to access login or register
app.get(["/login", "/register"], (req, res) => {
  if (req.session.user) return res.status(302).json({ redirect: "/dashboard" });
  res.status(200).json({ message: "Proceed to login or register" });
});

// Registration Route
app.post("/register", async (req, res) => {
  try {
    const { registration_number, name, password, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ registration_number });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({ registration_number, name, password: hashedPassword, role });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login Route
app.post("/login", async (req, res) => {
  try {
    const { registration_number, name, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ registration_number, name });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ message: "Invalid credentials" });

    // Create session
    req.session.user = { registration_number: user.registration_number, name: user.name, role: user.role };

    res.json({ message: "Login successful", user: req.session.user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Dashboard Route
app.get("/dashboard", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Not logged in" });
  }

  const user = req.session.user;

  // For students, you could fetch only their complaints
  try {
    let complaints = [];

    if (user.role === "admin" || user.role === "worker") {
      complaints = await Complaint.find().sort({ dateLogged: -1 });
    } else if (user.role === "student") {
      complaints = await Complaint.find({ "loggedBy.registrationNumber": user.registration_number }).sort({ dateLogged: -1 });
    }

    res.json({ user, complaints });
  } catch (err) {
    console.error("Error fetching complaints:", err);
    res.status(500).json({ message: "Failed to fetch complaints" });
  }
});

// Logout Route
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: "Logout failed" });
    res.clearCookie("connect.sid");
    res.json({ message: "Logout successful" });
  });
});

// 🏢 Get all buildings
app.get("/building", async (req, res) => {
  try {
    const buildings = await Building.find();
    res.json(buildings);
  } catch (error) {
    console.error("Error fetching buildings:", error);
    res.status(500).json({ message: "Error fetching buildings" });
  }
});

// 🏗️ Add a new building (Admins only)
app.post("/building", async (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(403).json({ message: "Unauthorized: Admins only" });
  }

  const { buildingName } = req.body;
  if (!buildingName) {
    return res.status(400).json({ message: "Building name is required" });
  }

  try {
    const newBuilding = new Building({ buildingName, floors: [] });
    await newBuilding.save();
    res.status(201).json({ message: "Building added successfully", building: newBuilding });
  } catch (error) {
    console.error("Error adding building:", error);
    res.status(500).json({ message: "Error adding building" });
  }
});

// ❌ Delete a building (Admins only)
app.delete("/building/:buildingId", async (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(403).json({ message: "Unauthorized: Admins only" });
  }

  const { buildingId } = req.params;
  try {
    const deletedBuilding = await Building.findByIdAndDelete(buildingId);
    if (!deletedBuilding) {
      return res.status(404).json({ message: "Building not found" });
    }
    res.json({ message: "Building deleted successfully" });
  } catch (error) {
    console.error("Error deleting building:", error);
    res.status(500).json({ message: "Error deleting building" });
  }
});


// ✅ Fetch floors of a building
app.get("/buildings/:buildingId/floors", async (req, res) => {
  try {
    const building = await Building.findById(req.params.buildingId);
    if (!building) return res.status(404).json({ message: "Building not found" });

    res.json(building.floors);
  } catch (error) {
    res.status(500).json({ message: "Error fetching floors" });
  }
});

// ✅ Add a floor to a building
app.post("/buildings/:buildingId/floors", async (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(403).json({ message: "Unauthorized: Admins only" });
  }

  try {
    console.log("🔵 Received floor data:", req.body);

    const building = await Building.findById(req.params.buildingId); // FIXED
    if (!building) return res.status(404).json({ message: "Building not found" });

    const newFloor = { floorName: req.body.floorName, floorNumber: req.body.floorNumber };
    building.floors.push(newFloor);
    await building.save();

    res.status(201).json({ message: "Floor added successfully", floors: building.floors });
  } catch (error) {
    console.error("❌ Error adding floor:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Delete a floor from a building
app.delete("/buildings/:buildingId/floors/:floorId", async (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(403).json({ message: "Unauthorized: Admins only" });
  }

  try {
    const building = await Building.findById(req.params.buildingId); // FIXED
    if (!building) return res.status(404).json({ message: "Building not found" });

    building.floors = building.floors.filter(floor => floor._id.toString() !== req.params.floorId);
    await building.save();

    res.json({ message: "Floor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting floor" });
  }
});

  
// Get Rooms
app.get("/buildings/:buildingId/floors/:floorId/rooms", async (req, res) => {
  try {
    const building = await Building.findById(req.params.buildingId);
    if (!building) return res.status(404).json({ message: "Building not found" });

    const floor = building.floors.id(req.params.floorId);
    if (!floor) return res.status(404).json({ message: "Floor not found" });

    res.json(floor.rooms);
  } catch (error) {
    res.status(500).json({ message: "Error fetching rooms" });
  }
});

// Add Rooms
app.post("/buildings/:buildingId/floors/:floorId/rooms", async (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(403).json({ message: "Unauthorized: Admins only" });
  }

  try {
    const building = await Building.findById(req.params.buildingId);
    if (!building) return res.status(404).json({ message: "Building not found" });

    const floor = building.floors.id(req.params.floorId);
    if (!floor) return res.status(404).json({ message: "Floor not found" });

    const newRoom = { roomName: req.body.roomName, roomNumber: req.body.roomNumber };
    floor.rooms.push(newRoom);
    await building.save();

    res.status(201).json({ message: "Room added successfully", rooms: floor.rooms });
  } catch (error) {
    res.status(500).json({ message: "Error adding room" });
  }
});

// Delete Rooms
app.delete("/buildings/:buildingId/floors/:floorId/rooms/:roomId", async (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(403).json({ message: "Unauthorized: Admins only" });
  }

  try {
    const building = await Building.findById(req.params.buildingId);
    if (!building) return res.status(404).json({ message: "Building not found" });

    const floor = building.floors.id(req.params.floorId);
    if (!floor) return res.status(404).json({ message: "Floor not found" });

    floor.rooms = floor.rooms.filter(room => room._id.toString() !== req.params.roomId);
    await building.save();

    res.json({ message: "Room deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting room" });
  }
});

  

// Get Objects
app.get("/building/:buildingId/floor/:floorId/room/:roomId/objects", async (req, res) => {
  try {
    console.log("Fetching objects for Room ID:", req.params.roomId); // 🛠 Debug Log

    const building = await Building.findById(req.params.buildingId);
    if (!building) {
      console.error("Building not found:", req.params.buildingId);
      return res.status(404).json({ message: "Building not found" });
    }

    // Find floor inside building
    const floor = building.floors.id(req.params.floorId);
    if (!floor) {
      console.error("Floor not found:", req.params.floorId);
      return res.status(404).json({ message: "Floor not found" });
    }

    // Find room inside floor
    const room = floor.rooms.id(req.params.roomId);
    if (!room) {
      console.error("Room not found:", req.params.roomId);
      return res.status(404).json({ message: "Room not found" });
    }

    console.log("Room found:", room); // Debug log

    // Sort objects by type
    const typeOrder = ["board", "projector", "ac", "fan", "table", "chair"];
    const sortedObjects = room.objects.sort((a, b) => typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type));

    res.json(sortedObjects.length > 0 ? sortedObjects : []); // ✅ Return empty array if no objects exist
  } catch (error) {
    console.error("Error fetching objects:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// Add Object
app.post("/building/:buildingId/floor/:floorId/room/:roomId/objects", async (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(403).json({ message: "Unauthorized: Admins only" });
  }

  try {
    const building = await Building.findById(req.params.buildingId);
    if (!building) return res.status(404).json({ message: "Building not found" });

    const floor = building.floors.id(req.params.floorId);
    if (!floor) return res.status(404).json({ message: "Floor not found" });

    const room = floor.rooms.id(req.params.roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    const { name, type } = req.body;
    if (!name || !type) return res.status(400).json({ message: "Name and type are required" });

    // Ensure objects array exists
    if (!room.objects) room.objects = [];

    room.objects.push({ name, type, complaints: [] });
    await building.save(); // ✅ Save entire building (since rooms are nested)

    res.status(201).json({ message: "Object added successfully", objects: room.objects });
  } catch (error) {
    console.error("Error adding object:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete Object

app.delete("/building/:buildingId/floor/:floorId/room/:roomId/objects/:objectId", async (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(403).json({ message: "Unauthorized: Admins only" });
  }

  try {
    const building = await Building.findById(req.params.buildingId);
    if (!building) return res.status(404).json({ message: "Building not found" });

    const floor = building.floors.id(req.params.floorId);
    if (!floor) return res.status(404).json({ message: "Floor not found" });

    const room = floor.rooms.id(req.params.roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    // Find and remove object by ID
    const objectIndex = room.objects.findIndex(obj => obj._id.toString() === req.params.objectId);
    if (objectIndex === -1) {
      return res.status(404).json({ message: "Object not found" });
    }

    room.objects.splice(objectIndex, 1); // Remove object
    await building.save(); // ✅ Save the updated building document

    res.json({ message: "Object deleted successfully", objects: room.objects });
  } catch (error) {
    console.error("Error deleting object:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// List of Complaints
app.get("/building/:buildingId/floor/:floorId/room/:roomId/objects/:objectId/complaints", async (req, res) => {
  const { buildingId, floorId, roomId, objectId } = req.params;

  try {
    const complaints = await Complaint.find({ objectId });

    // Also fetch metadata
    const building = await Building.findById(buildingId);
    const floor = building.floors.id(floorId);
    const room = floor.rooms.id(roomId);
    const object = room.objects.id(objectId);

    res.json({
      complaints,
      meta: {
        buildingName: building.buildingName,
        floorNumber: floor.floorNumber,
        roomName: room.roomName,
        objectName: object.name,
        objectType: object.type
      }
    });
  } catch (err) {
    console.error("Error fetching complaints:", err);
    res.status(500).json({ error: "Server error while fetching complaints" });
  }
});


// Add a complaint

app.post("/complaints", async (req, res) => {
  try {
    const { objectId, buildingId, floorId, roomId, text } = req.body;
    const user = req.session.user;

    if (!user || !user.registration_number || !user.name) {
      console.log("❌ Invalid or missing user session:", user);
      return res.status(401).json({ message: "Unauthorized - user session invalid" });
    }

    if (!objectId || !buildingId || !floorId || !roomId || !text) {
      console.log("❌ Missing fields:", req.body);
      return res.status(400).json({ message: "All fields are required" });
    }

    const complaint = new Complaint({
      objectId,
      buildingId,
      floorId,
      roomId,
      text,
      loggedBy: {
        registrationNumber: user.registration_number,
        name: user.name
      }
    });

    await complaint.save();

    console.log("✅ Complaint saved:", complaint);
    res.status(201).json({ message: "Complaint logged successfully" });
  } catch (error) {
    console.error("🔥 Error in /complaints POST:", error);
    res.status(500).json({ message: "Server error" });
  }
});


app.patch("/complaints/:id/resolve", async (req, res) => {
  try {
    const user = req.session.user;

    if (!user || (user.role !== "admin" && user.role !== "worker")) {
      console.log("❌ Unauthorized role:", user?.role);
      return res.status(403).json({ message: "Access denied" });
    }

    const complaintId = req.params.id;

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (complaint.status === "resolved") {
      return res.status(400).json({ message: "Complaint already resolved" });
    }

    complaint.status = "resolved";
    complaint.dateResolved = new Date();
    complaint.resolvedBy = {
      registrationNumber: user.registration_number,
      name: user.name,
    };

    await complaint.save();

    console.log("✅ Complaint resolved:", complaint);
    res.json({ message: "Complaint resolved successfully" });
  } catch (error) {
    console.error("🔥 Error resolving complaint:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// Start Server
app.listen(port, () => console.log(`Server running on port ${port}`));
