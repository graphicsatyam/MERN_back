import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from '../models/UserSchema.js';
import nodemailer from 'nodemailer';

const router = express.Router();

// User signup
router.post("/signup", async (req, res) => {
    const { name, email, createpassword, confirmpassword, number } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Validate passwords
        if (createpassword !== confirmpassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(createpassword, 10);

        // Create a new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            number
        });

        // Save the user to the database
        await newUser.save();
        return res.status(201).json({ status: true, message: "Record registered successfully" });
    } catch (error) {
        console.error("Error during signup:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

// User login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not registered" });
        }

        // Verify the password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ message: "Password is incorrect" });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id, name: user.name }, process.env.KEY, { expiresIn: '1h' });
        
        // Set cookie with the token
        res.cookie('token', token, { httpOnly: true, maxAge: 360000 }); // 1 hour
        return res.status(200).json({ status: true, message: "Login successful" });
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

// Forgot password
router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;

    try {
        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not registered" });
        }

        // Generate password reset token
        const token = jwt.sign({ id: user._id }, process.env.RESET_PASSWORD_KEY, { expiresIn: '5m' });

        // Nodemailer transporter setup
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Reset password URL
        const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${token}`;

        // Email options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Reset Password',
            text: `Please click on the following link to reset your password: ${resetUrl}`
        };

        // Send email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error sending email:", error);
                return res.status(500).json({ message: "Error sending email" });
            } else {
                return res.status(200).json({ status: true, message: "Email sent successfully" });
            }
        });

    } catch (error) {
        console.error("Error during forgot password:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

// Reset password
router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        // Verify the reset password token
        const decoded = jwt.verify(token, process.env.RESET_PASSWORD_KEY);
        const userId = decoded.id;

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update the user's password
        await User.findByIdAndUpdate(userId, { password: hashedPassword });

        return res.status(200).json({ status: true, message: "Password updated successfully" });
    } catch (error) {
        console.error("Error during reset password:", error);
        return res.status(400).json({ message: "Invalid or expired token" });
    }
});

// Middleware to verify the user's JWT token
const verifyUser = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ status: false, message: "No token provided" });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error("Unauthorized access:", error);
        return res.status(401).json({ status: false, message: "Unauthorized" });
    }
};

// Verify user route
router.get('/verify', verifyUser, (req, res) => {
    return res.status(200).json({ status: true, message: "Authorized" });
});

// User logout
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    return res.status(200).json({ status: true, message: "Logged out successfully" });
});

export { router as UserRouter };
