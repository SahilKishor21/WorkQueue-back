const User = require('../models/userModels');
const Admin = require('../models/adminModel');
const Assignment = require('../models/assignmentModel');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const { registerValidation, loginValidation } = require('../validators/userValidator');

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, call) => {
        call(null, './uploads'); 
    },
    filename: (req, file, call) => {
        call(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/pdf', 'application/vnd.ms-powerpoint', 'text/csv'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only .pdf, .ppt, and .csv files are allowed.'));
        }
    }
}).single('taskFile'); // The name must match the input field in the frontend

// User Registration
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate input
        const { error } = registerValidation(req.body);
        if (error) return res.status(400).json({ msg: error.details[0].message });

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        user = new User({ name, email, password });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        res.status(201).json({ msg: 'User registered successfully', user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// User Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        const { error } = loginValidation(req.body);
        if (error) return res.status(400).json({ msg: error.details[0].message });

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        res.status(200).json({ msg: 'Login successful', user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Upload Assignment
exports.uploadAssignment = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }

        const { title, adminId } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        try {
            const userId = req.user.userId; 

            const admin = await Admin.findById(adminId);
            if (!admin) return res.status(404).json({ msg: 'Admin not found' });

            const assignment = new Assignment({
                userId,
                adminId,
                title,
                filePath: req.file.path,
                createdAt: new Date()
            });

            await assignment.save();
            res.status(201).json({ msg: 'Assignment uploaded successfully', assignment });
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ message: 'Server error' });
        }
    });
};

// Get All Admins
exports.getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.find({}, 'name email'); 
        res.json(admins);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
