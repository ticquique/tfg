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


const _addRole = function (newRole, callback) {
    newRole.save(callback);
}
const _getRoleById = function (id, callback) {
    Role.findById(id, callback);
}
const _updateRole = function (id, query, callback) {
    Role.findByIdAndUpdate(id, { $set: query }, callback);
}
const _deleteRole = function (id, callback) {
    Role.findByIdAndRemove({ _id: id }, callback);
}
const _getAllRoles = function (callback) {
    return Role.find({}, callback);
}

module.exports.addRole = _addRole;
module.exports.getRoleById = _getRoleById;
module.exports.updateRole = _updateRole;
module.exports.deleteRole = _deleteRole;
module.exports.getAllRoles = _getAllRoles;