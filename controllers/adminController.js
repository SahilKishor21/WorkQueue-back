const Admin = require('../models/adminModel');
const Assignment = require('../models/assignmentModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Admin Registration
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        let admin = await Admin.findOne({ email });
        if (admin) return res.status(400).json({ msg: 'Admin already exists' });

        admin = new Admin({ name, email, password });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash(password, salt);

        await admin.save();

        // Return JWT
        const payload = { adminId: admin.id, role: 'Admin' };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Admin Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email });
        if (!admin) return res.status(400).json({ msg: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        // Return JWT
        const payload = { adminId: admin.id, role: 'Admin' };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get Assignments
exports.getAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.find({ adminId: req.user.adminId })
            .populate('userId', 'name')
            .sort({ createdAt: -1 });

        res.json(assignments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Accept Assignment
exports.acceptAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) return res.status(404).json({ msg: 'Assignment not found' });

        if (assignment.adminId.toString() !== req.user.adminId)
            return res.status(403).json({ msg: 'Not authorized' });

        assignment.status = 'Accepted';
        await assignment.save();

        res.json({ msg: 'Assignment accepted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Reject Assignment
exports.rejectAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) return res.status(404).json({ msg: 'Assignment not found' });

        if (assignment.adminId.toString() !== req.user.adminId)
            return res.status(403).json({ msg: 'Not authorized' });

        assignment.status = 'Rejected';
        await assignment.save();

        res.json({ msg: 'Assignment rejected' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
