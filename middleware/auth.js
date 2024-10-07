// middleware/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY;

// JWT authentication middleware
const authenticateJWT = (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1]; // Extract token

    if (!token) {
        return res.status(401).json({ error: 'Token not found' }); // Token not found
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' }); // Token is invalid
        }
        req.user = user; // Store user info in request
        next(); // Proceed to the next middleware or route
    });
};

module.exports = authenticateJWT;
