import mongoose from "mongoose";
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const connection = async () => {
    try {
        await mongoose.connect(process.env.DB_CONNECTION_STRING);
        console.log('Connected to the database.');
    } catch (error) {
        console.error('Could not connect to the database.', error);
        process.exit(1); // Exit process with failure
    }
};

export default mongoose;

 