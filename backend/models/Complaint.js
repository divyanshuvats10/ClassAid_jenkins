const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
  objectId: { type: String, required: true },
  buildingId: { type: String, required: true },
  floorId: { type: String, required: true },
  roomId: { type: String, required: true },
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
  status: { type: String, enum: ["pending", "resolved"], default: "pending" }
});

module.exports = mongoose.model("Complaint", complaintSchema);
