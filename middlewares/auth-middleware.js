const jwt = require("jsonwebtoken");
const { User } = require("../models/UserSchema");

const authMiddleware = async (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ message: "Unauthorized HTTP, Token not Provided" });
    }

    const jwtToken = token.replace("Bearer", "").trim();
    console.log("Token from auth middleware:", jwtToken);

    try {
        const isVerified = jwt.verify(jwtToken, process.env.JWT_SECRET_KEY);
        console.log(isVerified);

        const userData = await User.findOne({ email: isVerified.email });
        if (!userData) {
            return res.status(401).json({ message: "Unauthorized. User not found" });
        }

        req.user = userData;

        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized. Invalid Token" });
    }
};

module.exports = authMiddleware;

// Example route handler
const express = require("express");
const router = express.Router();

router.get("/dashboard", authMiddleware, (req, res) => {
    // Send user data to the frontend
    res.json({
        message: "Data fetched successfully",
        user: req.user,
        // Add other data you want to send
    });
});

module.exports = router;
