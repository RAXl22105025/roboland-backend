const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Certificate = require('./models/Certificate');

const app = express();

// Middleware
app.use(express.json());
// Replace app.use(cors()); with this:
app.use(cors({
    origin: "*", 
    methods: ["GET", "POST", "OPTIONS"], // Add OPTIONS here!
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Successfully connected to MongoDB!'))
    .catch((err) => console.error('Database connection error:', err));

// A simple test route
app.get('/', (req, res) => {
    res.send('ROBOLAND Backend is successfully running!');
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

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Invalid email or password!" });
        }

        // Check if password matches
        if (user.password !== password) {
            return res.status(400).json({ error: "Invalid email or password!" });
        }

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
app.get('/api/certificates/create-test', async (req, res) => {
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
//aichatbot
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        // Use gemini-2.5-flash as it is the most stable production model currently
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

        let attempts = 0;
        let aiResponse;
        
        // Simple retry loop (tries 3 times if it hits a 503)
        while (attempts < 3) {
            aiResponse = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: "System: You are ROBOLAND AI. Focus on robotics, AI, Linux, electronics, and IoT. User: " + message }] }]
                })
            });

            if (aiResponse.status !== 503) break; // If it's not a server overload, stop retrying
            
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 2000 * attempts)); // Wait 2s, then 4s...
        }

        const data = await aiResponse.json();
        if (aiResponse.ok && data.candidates) {
            res.status(200).json({ reply: data.candidates[0].content.parts[0].text });
        } else {
            res.status(500).json({ error: "Gemini is busy, try again in a minute." });
        }
    } catch (error) {
        res.status(500).json({ error: "Server error." });
    }
});
// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
