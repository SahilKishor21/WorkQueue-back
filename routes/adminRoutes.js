const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');

router.post('/register', adminController.register);
router.post('/login', adminController.login);
router.get('/assignments', auth('Admin'), adminController.getAssignments);
router.post('/assignments/:id/accept', auth('Admin'), adminController.acceptAssignment);
router.post('/assignments/:id/reject', auth('Admin'), adminController.rejectAssignment);

module.exports = router;
