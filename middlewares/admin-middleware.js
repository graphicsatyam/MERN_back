const jwt = require("jsonwebtoken");
const { Admin } = require("../models/AdminSchema");

const adminMiddleware = async (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ message: "Unauthorized HTTP, Token not Provided" });
    }

    const jwtToken = token.replace("Bearer", "").trim();
    console.log("Token from auth middleware:", jwtToken);

    try {
        const isVerified = jwt.verify(jwtToken, process.env.JWT_SECRET_KEY);
        console.log(isVerified);

        const adminData = await Admin.findOne({ email: isVerified.email });
        if (!adminData) {
            return res.status(401).json({ message: "Unauthorized. User not found" });
        }

        req.admin = adminData;

        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized. Invalid Token" });
    }
};

module.exports = adminMiddleware;

// Example route handler
const express = require("express");
const router = express.Router();

router.get("/main", adminMiddleware, (req, res) => {
    // Send user data to the frontend
    res.json({
        message: "Data fetched successfully",
        admin: req.admin,
        // Add other data you want to send
    });
});

module.exports = router;
