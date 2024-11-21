const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/upload', auth('User'), userController.uploadAssignment);
router.get('/admins', auth('User'), userController.getAllAdmins);

module.exports = router;
