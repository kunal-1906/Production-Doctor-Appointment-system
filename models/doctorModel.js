const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    phoneNumber: { type: String, required: true },  // Ensure correct field name
    email: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    specialisation: { type: String, required: true },  // Ensure correct field name
    experience: { type: String, required: true },
    feesPerConsultation: { type: String, required: true }, // Ensure correct field name
    timings: { type: [String], required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, default: "pending" }
});

module.exports = mongoose.model("Doctor", doctorSchema);
