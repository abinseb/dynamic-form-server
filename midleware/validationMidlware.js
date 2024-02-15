// userValidationMiddleware.js
const { validationResult, check, body } = require('express-validator');

const validateUserData = [
    // Validate name, email, mobile, and password
    check('name').notEmpty().withMessage('Name is required'),
    check('email').isEmail().withMessage('Invalid Email'),
    check('mobile').isMobilePhone().withMessage('Invalid Mobile Number'),
    check('password').isLength({ min: 5 }).withMessage('Password must be at least 5 characters long'),

    // Custom sanitizer to trim whitespace from email
    body('email').trim().normalizeEmail(),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = validateUserData;
