const Head = require('../models/headModel');
const Assignment = require('../models/assignmentModel'); 
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

/* generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });
}; */


// Register 
exports.registerHead = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const existingHead = await Head.findOne({ email });
        if (existingHead) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const head = new Head({ name, email, password });
        await head.save();

        const token = generateToken(head._id);
        res.status(201).json({ message: 'Head registered successfully', token });
    } catch (error) {
        res.status(500).json({ error: 'Registration failed', details: error.message });
    }
};

// Login 
exports.loginHead = async (req, res) => {
    const { email, password } = req.body;

    try {
        const head = await Head.findOne({ email });
        if (!head) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, head.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const token = generateToken(head._id);
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ error: 'Login failed', details: error.message });
    }
};



// Get recent assignments
exports.getRecentAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.find({})
            .sort({ createdAt: -1 }) // Sort by most recent
            .limit(10); // Limit to 10 recent assignments

        res.status(200).json({ assignments });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch assignments', details: error.message });
    }
};

// Get all assignments
exports.getAllAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.find({});
        res.status(200).json({ assignments });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch assignments', details: error.message });
    }
};

// Accept an assignment
exports.acceptAssignment = async (req, res) => {
    const { id } = req.params;

    try {
        const assignment = await Assignment.findById(id);
        if (!assignment) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        assignment.status = 'Accepted';
        assignment.overturnedBy = null; // Clear overturn data if Head overrides later
        await assignment.save();

        res.status(200).json({ message: 'Assignment accepted', assignment });
    } catch (error) {
        res.status(500).json({ error: 'Failed to accept assignment', details: error.message });
    }
};

// Reject an assignment
exports.rejectAssignment = async (req, res) => {
    const { id } = req.params;

    try {
        const assignment = await Assignment.findById(id);
        if (!assignment) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        assignment.status = 'Rejected';
        assignment.overturnedBy = null; // Clear overturn data if Head overrides later
        await assignment.save();

        res.status(200).json({ message: 'Assignment rejected', assignment });
    } catch (error) {
        res.status(500).json({ error: 'Failed to reject assignment', details: error.message });
    }
};

// Overturn Admin decision
exports.overturnDecision = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Accepted', 'Rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    try {
        const assignment = await Assignment.findById(id);
        if (!assignment) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        assignment.status = status;
        assignment.overturnedBy = req.headId; 
        await assignment.save();

        res.status(200).json({ message: 'Decision overturned', assignment });
    } catch (error) {
        res.status(500).json({ error: 'Failed to overturn decision', details: error.message });
    }
};
