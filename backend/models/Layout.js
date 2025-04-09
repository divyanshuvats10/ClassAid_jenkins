const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  text: { type: String, required: true },
  dateLogged: { type: Date, default: Date.now },
  loggedBy: {
    registrationNumber: { type: String, required: true },
    name: { type: String, required: true }
  },
  dateResolved: { type: Date },
  resolvedBy: {
    registrationNumber: { type: String },
    name: { type: String }
  },
  status: { type: String, enum: ['pending', 'resolved'], default: 'pending' }
});

const objectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  complaintIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Complaint' }] // ✅ Only references
});

const roomSchema = new mongoose.Schema({
  roomName: { type: String, required: true },
  objects: [objectSchema] // Array of objects within the room
});

const floorSchema = new mongoose.Schema({
  floorNumber: { type: Number, required: true },
  rooms: [roomSchema] // Array of rooms on each floor
});

const buildingSchema = new mongoose.Schema({
  buildingName: { type: String, required: true },
  floors: [floorSchema] // Array of floors within the building
});

module.exports = mongoose.model('Building', buildingSchema);
