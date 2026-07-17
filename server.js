const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Certificate = require('./models/Certificate');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Successfully connected to MongoDB!'))
    .catch((err) => console.error('Database connection error:', err));

// A simple test route
app.get('/', (req, res) => {
    res.send('ROBOLAND Backend is successfully running!');
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


// Register a new user
app.post('/api/register', async (req, res) => {
    try {
        const { fullName, email, username, password, role } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already in use!" });
        }

        // Create and save the new user
        const newUser = new User({ fullName, email, username, password, role });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error during registration." });
    }
});

// Login a user
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found! Please register." });
        }

        // 2. Check if the password matches
        if (user.password !== password) {
            return res.status(401).json({ error: "Invalid password!" });
        }

        // 3. Success! (Send back a success message and the username)
        res.status(200).json({ message: "Login successful!", username: user.username });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error during login." });
    }
});

// Verify a certificate
app.get('/api/certificates/:id', async (req, res) => {
    try {
        const certificate = await Certificate.findOne({ certificateId: req.params.id });
        
        if (!certificate) {
            return res.status(404).json({ error: "Certificate not found!" });
        }
        
        res.status(200).json(certificate);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error." });
    }
});

// A temporary route to create test certificates
app.post('/api/certificates/create-test', async (req, res) => {
    try {
        const newCert = new Certificate({
            certificateId: "RB-2026-001",
            studentName: "John Doe",
            courseName: "Robotics Fundamentals",
            issueDate: "01 January 2026"
        });
        await newCert.save();
        res.status(201).json({ message: "Test certificate created!" });
    } catch (error) {
        res.status(500).json({ error: "Error creating test certificate." });
    }
});