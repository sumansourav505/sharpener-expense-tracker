const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.split(' ')[1];
        console.log('Authorization Header:', req.header('Authorization'));
        console.log('Token:', token);

        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, 'secretkey');
        console.log('Decoded Token:', decoded);

        // Ensure decoded token has a valid userId
        if (!decoded || !decoded.userId) {
            console.error('Decoded token has no userId:', decoded);
            return res.status(400).json({ message: 'Invalid token structure.' });
        }

        const user = await User.findByPk(decoded.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        req.user = user; // Attach authenticated user to the request
        next();
    } catch (error) {
        console.error('Authentication error:', error.name, error.message);
        
        // Check for specific JWT errors
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired. Please log in again.' });
        }

        res.status(401).json({ message: 'Invalid or expired token.' });
    }
};

module.exports = { authenticate };
