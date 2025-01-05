const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    // Check if it's a Bearer token
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    // Get the token without "Bearer "
    const token = authHeader.substring(7);

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded); // Debug log
    
    // Get user from database
    const user = await User.findById(decoded._id).select('-password');
    console.log('Found user:', user ? 'Yes' : 'No'); // Debug log
    
    if (!user) {
      console.log('User not found with ID:', decoded._id);
      return res.status(401).json({ message: 'Token is valid but user not found' });
    }

    // Add user and token to request
    req.user = user;
    req.token = token;
    
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = auth;
