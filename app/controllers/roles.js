var roleModel = require('../models/role');

const _getRole = function (id, callback) {
    let result = null;
    const role = roleModel.getRoleById(id, (err, role) => {
        if (err) {
            result = { success: false, msg: 'Role not found' }
        } else {
            result = { success: true, msg: 'Role found', role }
        }
        callback(result);
    });
}

const _newRole = function (name, callback) {
    let result = null; 
    let newRole = new roleModel({
        name: name,
    });
    roleModel.addRole(newRole, (err, role) => {
        if (err) {
            result = { success: false, msg: 'Failed to register role' + err };
        } else {
            result = { success: true, msg: 'Role registered' };
        }
        callback(result);
    });
}

const _updateRole = function(id, query, callback) {
    roleModel.updateRole(id, query, (err, role) => {
        if (err) {
            result = { success: false, msg: 'Failed to update role' + err };
        } else {
            result = { success: true, msg: 'Role correctly updated' };
        }
        callback(result);
    });
}

const _deleteRole = function(id, callback) {
    let result = null;
    roleModel.deleteRole(id, (err, role) => {
        if (err) {
            result = { success: false, msg: 'Failed to delete role' + err };
        } else {
            result = { success: true, msg: 'Role correctly deleted' };
        }
        callback(result);
    });
}

const _getAllRoles = function(callback) {
    const roles = roleModel.getAllRoles((err, roles) => {
        if (err) {
            result = { success: false, msg: 'Failed in method listRoles' };
        } else {
           result = { success: true, msg: 'Correctly listed all roles', roles };
        }
        callback(result);
    });
}


//FUNCTIONS TO ROUTES

const _getRoleFR = function (req, res, callback) {
    _getRole(req.params.roleId, (role) => {
        res.json(role);
    });
}
const _newRoleFR = function (req, res, callback) {

    let wrongInputs = false;
    if (Object.keys(req.body).length > 1 || !req.body.hasOwnProperty('name') || req.body.name == "" || req.body.name == null) {
        wrongInputs = true;
    }
    if (wrongInputs) res.json({ success: false, msg: 'Failed to register role' });
    else {
        _newRole(req.body.name, (role) => {
            res.json(role);
        });
    }
}
const _updateRoleFR = function (req, res, callback) {
    const updates = req.body;
    let wrongInputs = false;
    Object.keys(updates).map(function (key, index) {
        if (key != "name") wrongInputs = true;
        else if (key == "name" && (updates.name == null || updates.name == "")) wrongInputs = true;
    });
    if (wrongInputs) res.json({ success: false, msg: 'Failed to update role' });
    else {
        _updateRole(req.params.roleId, updates, (result) => {
            res.json(result);
        });
    }
}
const _deleteRoleFR = function (req, res, callback) {
    _deleteRole(req.params.roleId, (result) => {
        res.json(result);
    })
}


const _listRolesFR = function (req, res, callback) {
    _getAllRoles((result)=>{
        res.json(result);
    })
}

module.exports.getRole = _getRole;
module.exports.getRoleFR = _getRoleFR;
module.exports.newRole = _newRole;
module.exports.newRoleFR = _newRoleFR;
module.exports.updateRole = _updateRole;
module.exports.updateRoleFR = _updateRoleFR;
module.exports.deleteRole = _deleteRole;
module.exports.deleteRoleFR = _deleteRoleFR;
module.exports.listRoles = _getAllRoles;
module.exports.listRolesFR = _listRolesFR;