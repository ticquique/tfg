
var userModel = require('../models/user');
var roleModel = require('../models/role');


const validateEmail = function (email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

const _getUser = function (id, callback) {
    let result = null;
    const user = userModel.getUserById(id, (err, user) => {
        if (err) {
            result = { success: false, msg: 'User not found' };
        } else {
            result = { success: true, msg: 'User found', user };
        }
        callback(result);
    });
}

const _newUser = function (email, username, password, role, callback) {
    let result = null;
    let newUser = new userModel({
        email: email,
        username: username,
        password: password,
        role: role
    });
    userModel.addUser(newUser, (err, user) => {
        if (err) {
            result = { success: false, msg: 'Failed to register user' + err };
        } else {
            result = { success: true, msg: 'User registered' };
        }
        callback(result);
    });
}

const _updateUser = function (id, query, callback) {
    let result = null;
    userModel.updateUser(id, query, (err, user) => {
        if (err) {
            result = { success: false, msg: 'Failed to update user' + err };
        } else {
            result = { success: true, msg: 'User correctly updated' };
        }
        callback(result);
    });
}

const _deleteUser = function (id, callback) {
    let result = null;
    userModel.deleteUser(id, (err, user) => {
        if (err) {
            result = { success: false, msg: 'Failed to delete user' + err };
        } else {
            result = { success: true, msg: 'User correctly deleted' };
        }
        callback(result);
    });
}

const _listUsers = function (callback) {
    let result = null;
    const users = userModel.getAllUsers((err, users) => {
        if (err) {
            result = { success: false, msg: 'Failed in method listUsers' };
        } else {
            result = { success: true, msg: 'Correctly listed all users', users };
        }
        callback(result);
    });
}
//FUNCTIONS TO ROUTES

const _getUserFR = function (req, res, callback) {
    _getUser(req.params.userId, (result) => {
        res.json(result);
    })
}


const _newUserFR = function (req, res, callback) {

    let wrongInputs = false;
    if (Object.keys(req.body).length > 4 || !req.body.hasOwnProperty("email") || !req.body.hasOwnProperty("username") || !req.body.hasOwnProperty("password") || !req.body.hasOwnProperty("role") || req.body.email == "" || req.body.email == null || !validateEmail(req.body.email) || req.body.username == "" || req.body.username == null || req.body.password == "" || req.body.password == null || req.body.password.lenth < 8) {
        wrongInputs = true;
    }
    if (wrongInputs) res.json({ success: false, msg: 'Failed to register user' });
    else {
        _newUser(req.body.email, req.body.username, req.body.password, req.body.role, (result) => {
            res.json(result);
        })
    }
}

const _updateUserFR = function (req, res, callback) {
    const updates = req.body;
    let wrongInputs = false;
    Object.keys(updates).map(function (key, index) {
        if (key != "email" && key != "password" && key != "username" && key != "role") wrongInputs = true;
        else if (key == "email" && (!validateEmail(updates.email) || updates.email == null || updates.email == "")) wrongInputs = true;
        else if (key == "password" && (updates.password == null || updates.password == "" || updates.password.length < 8)) wrongInputs = true;
        else if (key == "username" && (updates.username == null || updates.username == "")) wrongInputs = true;
        else if (key == "role" && (updates.role == null || updates.role == "")) {
            wrongInputs = true;
        }
    });

    if (wrongInputs) res.json({ success: false, msg: 'Failed to update user' });
    else {
        _updateUser(req.params.userId, updates, (result) => {
            res.json(result);
        })
    }
}

const _deleteUserFR = function (req, res, callback) {
    _deleteUser(req.params.userId, (result) => {
        res.json(result);
    })
}


const _listUsersFR = function (req, res, callback) {
    _listUsers((result) => {
        res.json(result);
    })
}


module.exports.getUser = _getUser;
module.exports.getUserFR = _getUserFR;
module.exports.newUser = _newUser;
module.exports.newUserFR = _newUserFR;
module.exports.updateUser = _updateUser;
module.exports.updateUserFR = _updateUserFR;
module.exports.deleteUser = _deleteUser;
module.exports.deleteUserFR = _deleteUserFR;
module.exports.listUsers = _listUsers;
module.exports.listUsersFR = _listUsersFR;