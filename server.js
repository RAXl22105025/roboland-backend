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

app.post('/api/chat', async (req, res) => {
    console.log("SUCCESS: Request received at /api/chat"); 
    
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ error: "Message is required" });

        // Change the URL to use gemini-3.5-flash
const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        contents: [{
            parts: [{
                text: "System: You are ROBOLAND AI. Focus on robotics, AI, Linux, electronics, and IoT. Politely decline unrelated topics.\n\nUser: " + message
            }]
        }]
    })
});

        const data = await aiResponse.json();

        if (aiResponse.ok && data.candidates && data.candidates[0].content) {
            const replyText = data.candidates[0].content.parts[0].text;
            res.status(200).json({ reply: replyText });
        } else {
            // This will show the actual reason Google rejected it in your Render logs
            console.error("Gemini API Error details:", JSON.stringify(data, null, 2));
            res.status(500).json({ error: "Gemini API returned an error." });
        }
    } catch (error) {
        console.error("CRITICAL Chat error:", error);
        res.status(500).json({ error: "Server error during chat." });
    }
});
// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
