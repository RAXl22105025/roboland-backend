const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true }
}, { timestamps: true }); // timestamps automatically adds 'createdAt' and 'updatedAt'

module.exports = mongoose.model('User', userSchema);