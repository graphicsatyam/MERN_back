import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true},
    email: { type: String, required: true, unique: true},
    password: { type: String, required: true },
    number: { type: String, required: true },
    
});

const Admin = mongoose.model('Admin', adminSchema);

export { Admin };

