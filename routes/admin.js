import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Admin } from '../models/AdminSchema.js';
import nodemailer from 'nodemailer';

const router = express.Router();

router.post("/adminsignup", async (req, res) => {
    const { name, email, createpassword, confirmpassword, number } = req.body;

    try {
        const admin = await Admin.findOne({ email });
        if (admin) {
            return res.status(400).json({ message: "Admin already exists" });
        }

        if (createpassword !== confirmpassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        const hashpassword = await bcrypt.hash(createpassword, 10);

        const newAdmin = new Admin({
            name,
            email,
            password: hashpassword,
            number
        });

        // Save admin to database
        
        await newAdmin.save();
        return res.status(201).json({ status: true, message: "Admin registered" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post('/adminlogin', async (req, res) => {
    const { email, password } = req.body;

    try {
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(400).json({ message: "Admin is not registered" });
        }

        const validPassword = await bcrypt.compare(password, admin.password);
        if (!validPassword) {
            return res.status(400).json({ message: "Password is incorrect" });
        }

        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true, maxAge: 3600000 });
        return res.status(200).json({ status: true, message: "Login successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;
    try {
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(400).json({ message: "Admin not registered" });
        }

        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '5m' });

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
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const id = decoded.id;
        const hashPassword = await bcrypt.hash(password, 10);
        await Admin.findByIdAndUpdate(id, { password: hashPassword });
        return res.status(200).json({ status: true, message: "Password updated successfully" });
    } catch (error) {
        console.error("Invalid token", error);
        return res.status(400).json({ message: "Invalid or expired token" });
    }
});

const verifyAdmin = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ status: false, message: "No token provided" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (error) {
        console.error("Unauthorized access", error);
        return res.status(401).json({ status: false, message: "Unauthorized" });
    }
};

router.get('/verify', verifyAdmin, (req, res) => {
    return res.json({ status: true, message: "Authorized" });
});

export { router as AdminRouter };
