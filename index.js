const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();
const authenticateJWT = require('./middleware/auth'); // Import the JWT middleware

// Environment variables
const MONGO_URI = process.env.MONGO_URI;
const SECRET_KEY = process.env.SECRET_KEY;

// Initialize app
const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Models
const User = require('./models/User');
const Coll = require('./models/Coll');

// Connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => { console.log('MongoDB connected'); })
  .catch(err => console.error(err));

// Login route
app.post('/login', async (req, res) => {
    const { user, password } = req.body;

    try {
        const foundUser = await User.findOne({ user });

        // Check if user exists and password matches
        if (!foundUser || foundUser.password !== password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate a token if needed (for example, if you use JWT)
        const token = jwt.sign({ user: foundUser.user }, SECRET_KEY, { expiresIn: '1h' });
        return res.status(200).json({ token });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/add-data', authenticateJWT, async (req, res) => { // Apply middleware here
    const { billNumber, amount, type } = req.body;
  
    try {
      const { user } = req.user; // Get user from the request
      const timestamp = new Date(); // Get the current date and time
      const newColl = new Coll({
        "bill_no" : billNumber,
        "amt" : amount,
        type,
        "user": user,
        "time": timestamp, // Add the timestamp
      });
  
      await newColl.save();
      res.json({ message: 'Data submitted successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to submit data' });
    }
  });


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
