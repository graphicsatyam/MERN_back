// Importing necessary modules
import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser'; // For Cookies
import adminRoutes from './routes/admin-router.js'; // Use import for ES modules
import { UserRouter } from './routes/user.js';

// Initialize dotenv
dotenv.config();

// Instantiate Express app
const app = express();

// Middleware
app.use(express.json()); // Parsing JSON bodies
app.use(cookieParser()); // Parse cookies

// CORS Options
const corsOptions = {
    origin: ["https://mern-front-silk.vercel.app"],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200 
};

app.use(cors(corsOptions)); // Enable CORS with credentials

// Routes
app.use('/auth', UserRouter); // Using UserRouter for paths starting with /auth
app.use('/api/admin', adminRoutes); // Use correct variable name and import statement

app.get('/', (req, res) => {
    res.send("Hi I am Backend Developer Vipin.....");
});

// Connecting to MongoDB with error handling
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/authentication', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.error("Failed to connect to MongoDB", err);
});

// Defining the port for the server to listen on
const PORT = process.env.PORT || 8080; // Default to 8080 if PORT is not defined

// Starting the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
