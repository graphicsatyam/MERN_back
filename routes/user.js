import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from '../models/UserSchema.js';
import nodemailer from 'nodemailer';

const router = express.Router();

router.post("/signup", async (req, res) => {
    const { name, email, createpassword, confirmpassword, number } = req.body;

    try {
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }

        if (createpassword !== confirmpassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        // Hash the password
        const hashpassword = await bcrypt.hash(createpassword, 10);

        // Create a new user
        const newUser = new User({
            name,
            email,
            password: hashpassword, // Store the hashed password in a single field
            number
        });

        // Save the user to the database
        await newUser.save();
        return res.status(201).json({ status: true, message: "Record registered" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User is not registered" });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: "Password is incorrect" });
        }

        const token = jwt.sign({ name: user.name }, process.env.KEY, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true, maxAge: 3600000 }); // maxAge is in milliseconds
        return res.status(200).json({ status: true, message: "Login successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});



router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not registered" });
        }

        // Generate token
        const token = jwt.sign({ id: user._id }, process.env.KEY, { expiresIn: '5m' });

        // Nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const resetUrl = `resetpassword/${token}`;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Reset Password',
            text: `Please click on the following link to reset your password: ${resetUrl}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error sending email:", error);
                return res.status(500).json({ message: "Error sending email" });
            } else {
                return res.status(200).json({ status: true, message: "Email sent successfully" });
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    try {
        const decoded = jwt.verify(token, process.env.KEY);
        const id = decoded.id;
        const hashPassword = await bcrypt.hash(password, 10);
        await User.findByIdAndUpdate(id, { password: hashPassword });
        return res.status(200).json({ status: true, message: "Password updated successfully" });
    } catch (error) {
        console.error("Invalid token", error);
        return res.status(400).json({ message: "Invalid or expired token" });
    }
});

// Middleware to verify user
const verifyUser = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ status: false, message: "No token provided" });
        }
        const decoded = jwt.verify(token, process.env.KEY);
        req.user = decoded;
        next();
    } catch (error) {
        console.error("Unauthorized access", error);
        return res.status(401).json({ status: false, message: "Unauthorized" });
    }
};



router.get('/verify', verifyUser, (req, res) => {
    return res.json({ status: true, message: "Authorized" });
});

router.get('/logout', (req, res) => {
    res.clearCookie('token')
    return res.json({status : true})
})


export { router as UserRouter };
