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
const Outstanding = require('./models/Outstanding'); // Ensure this path is correct

const seedOutstandingData = async () => {
  const outstandingData = [
    { bill_no: 'B001', amount: 1000, party: 'Party A', user: 'venkatesh' },
    { bill_no: 'B002', amount: 2000, party: 'Party A', user: 'venkatesh' },
    { bill_no: 'B003', amount: 1500, party: 'Party B', user: 'venkatesh' },
    { bill_no: 'B004', amount: 2500, party: 'Party C', user: 'sathish' },
    { bill_no: 'B005', amount: 1200, party: 'Party C', user: 'sathish' },
    { bill_no: 'B006', amount: 1800, party: 'Party D', user: 'ram' },
  ];

  try {
    // Insert the data into the Outstanding collection
    await Outstanding.insertMany(outstandingData);
    console.log('Seed data inserted successfully');
  } catch (err) {
    console.error('Error inserting seed data:', err);
  }
};

const seedUserData = async () => {
  const users = [
    { user: 'venkatesh', password: 'pass123' },
    { user: 'sathish', password: 'pass456' },
    { user: 'ram', password: 'pass789' },
  ];

  try { 
    await User.insertMany(users);
    console.log('User seed data inserted successfully');
  } catch (err) {
    console.error('Error inserting user seed data:', err);
  }
};

// Connect to MongoDB
const conn = mongoose.connect(MONGODB_URI,  {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex:true,
})
  .then(() => { 
    // seedOutstandingData();
    // seedUserData();
    console.log('MongoDB connected'); 
  })
  .catch(err => console.error(err));

app.get('/users', async (req, res) => {
  try {
    await conn ;
    const users = await User.find({}, 'user'); // Fetch only the username field
    const usernames = users.map(user => user.user); // Extract usernames from user objects
    res.json(usernames); // Send the list of usernames as a response
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }  
});


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

app.post('/add-data', authenticateJWT, async (req, res) => {
  const { party, totalAmount, chequeDate, type, bills } = req.body;
  const date = chequeDate ; 
  const amount = totalAmount ; 
  try {
    const { user } = req.user; // Get user from JWT
   
    const newColl = new Coll({
      party,
      amount,
      date,
      type,
      bills,
      user,
    });

    await newColl.save();
    res.json({ message: 'Data submitted successfully' });
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: 'Failed to submit data' });
  }
});

app.post('/outstanding', authenticateJWT, async (req, res) => {
  try {
    const { user } = req.user; // Get user from JWT

    const outstandingRecords = await Outstanding.find({ user });

    // Convert to dictionary format { party: [bill numbers] }
    const outstandingDict = outstandingRecords.reduce((acc, record) => {
      if (!acc[record.party]) {
        acc[record.party] = [];
      }
      acc[record.party].push(record.bill_no);
      return acc;
    }, {});

    res.json(outstandingDict);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch outstanding bills' });
  }
});

module.exports = app; 

// // // Start server
// const PORT = 5000 ;//process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
