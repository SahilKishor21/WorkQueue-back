const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
    head: { type: mongoose.Schema.Types.ObjectId, ref: 'Head' },
    task: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    status: { 
        type: String, 
        enum: ['Pending', 'Accepted', 'Rejected'], 
        default: 'Pending' 
    },
    label: { type: String, default: '' }, // Optional label for additional info
    adminDecision: {
        type: String,
        enum: ['Accepted', 'Rejected', 'Pending'],
        default: 'Pending'
    },
    headDecision: {
        type: String,
        enum: ['Accepted', 'Rejected', 'Overturned'],
        default: 'Pending'
    },
});

module.exports = mongoose.model('Assignment', AssignmentSchema);
