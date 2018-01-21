
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./user');
const Schema = mongoose.Schema;


const ValidSchema = mongoose.Schema({
    email: {
        type: String, required: true,
        unique: true
    },
    password: {
        type: String, required: true
    },
    userId: {
        type: Schema.Types.ObjectId  ,
        required: true, 
        ref: 'User'
    },
    role: {
        type: Schema.Types.ObjectId, required: true, ref: 'Role'
    },
    username: {
        type: String, required: true, unique: true
    },
    vars: {
        type: Array, required: false
    },
    token: {
        type: String, required: true
    }
}, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } });

const Valid = module.exports = mongoose.model('Valid', ValidSchema);