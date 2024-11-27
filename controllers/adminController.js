const Assignment = require('../models/assignmentModel'); 
const bcrypt = require('bcryptjs');
const Admin = require('../models/adminModel'); 

// Accept an assignment
const acceptAssignment = async (req, res) => {
    const { assignmentId } = req.params;

    try {
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        assignment.status = 'accepted';
        await assignment.save();

        const io = req.app.get('io'); // Access the io instance from server.js
        io.emit('notification', { message: `Assignment "${assignment.title}" has been accepted.` });

        return res.status(200).json({ message: 'Assignment accepted successfully.', assignment });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Reject an assignment
const rejectAssignment = async (req, res) => {
    const { assignmentId } = req.params;

    try {
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        assignment.status = 'rejected';
        await assignment.save();

        const io = req.app.get('io'); // Access the io instance from server.js
        io.emit('notification', { message: `Assignment "${assignment.title}" has been rejected.` });

        return res.status(200).json({ message: 'Assignment rejected successfully.', assignment });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Admin Registration
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        let admin = await Admin.findOne({ email });
        if (admin) return res.status(400).json({ message: 'Admin already exists' });

        admin = new Admin({ name, email, password });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash(password, salt);

        await admin.save();

        return res.status(201).json({
            message: 'Admin registered successfully.',
            admin: {
                id: admin.id,
                name: admin.name,
                email: admin.email,
            },
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

// Admin Login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await Admin.findOne({ email });
        if (!admin) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        return res.status(200).json({
            message: 'Admin logged in successfully.',
            admin: {
                id: admin.id,
                name: admin.name,
                email: admin.email,
            },
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

// Get Assignments
const getAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.find({ adminId: req.user.adminId })
            .populate('userId', 'name')
            .sort({ createdAt: -1 });

        res.json(assignments);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

module.exports = {
    acceptAssignment,
    rejectAssignment,
    register,
    login,
    getAssignments,
};
