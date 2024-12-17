// routes/auth.js
const express = require('express');
const { loginEmployee } = require('../controllers/authController');
const router = express.Router();

// Route for employee login
router.post('/login', loginEmployee);

module.exports = router;
