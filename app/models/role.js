const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Role Schema
const RoleSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});

const Role = module.exports = mongoose.model('Role', RoleSchema);