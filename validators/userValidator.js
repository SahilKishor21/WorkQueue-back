const Joi = require('joi');

// User Registration Validation
const registerValidation = (data) => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(30).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required()
    });
    return schema.validate(data);
};

// User Login Validation
const loginValidation = (data) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required()
    });
    return schema.validate(data);
};

// Assignment Upload Validation
const uploadAssignmentValidation = (data) => {
    const schema = Joi.object({
        task: Joi.string().min(3).required(),
        adminId: Joi.string().required()
    });
    return schema.validate(data);
};

module.exports = {
    registerValidation,
    loginValidation,
    uploadAssignmentValidation
};
