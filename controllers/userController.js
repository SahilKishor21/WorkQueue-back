const User = require('../models/userModels');
const Admin = require('../models/adminModel');
const Assignment = require('../models/assignmentModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { registerValidation, loginValidation, uploadAssignmentValidation } = require('../validators/userValidator');


// User Registration
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        user = new User({ name, email, password });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        // Return JWT
        const payload = { userId: user.id, role: 'User' };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }

// Inside the register function
const { error } = registerValidation(req.body);
if (error) return res.status(400).json({ msg: error.details[0].message });

};

// User Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        // Return JWT
        const payload = { userId: user.id, role: 'User' };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
    const { error } = loginValidation(req.body);
if (error) return res.status(400).json({ msg: error.details[0].message });
};

// Upload Assignment
exports.uploadAssignment = async (req, res) => {
    try {
        const { task, adminId } = req.body;
        const userId = req.user.userId;

        const admin = await Admin.findById(adminId);
        if (!admin) return res.status(404).json({ msg: 'Admin not found' });

        const assignment = new Assignment({ userId, task, adminId });
        await assignment.save();

        res.json({ msg: 'Assignment uploaded successfully', assignment });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
    const { error } = uploadAssignmentValidation(req.body);
if (error) return res.status(400).json({ msg: error.details[0].message });
};

// Get All Admins
exports.getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.find({}, 'name email'); // Only returning name and email fields for privacy
        res.json(admins);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
