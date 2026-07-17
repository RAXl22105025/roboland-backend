const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
    certificateId: { type: String, required: true, unique: true },
    studentName: { type: String, required: true },
    courseName: { type: String, required: true },
    issueDate: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Certificate', certificateSchema);