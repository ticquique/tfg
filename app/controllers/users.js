
var userModel = require('../models/user');
var Valid = require('../models/valid');


const validateEmail = function (email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

const _getUser = function (req, res, next) {
    try {

        req.checkParams("userId", "userId invalid").notEmpty().withMessage("userId can't be empty").isAlphanumeric().withMessage('userId must contain letters and numbers only');
        let errors = req.validationErrors();
        if (errors) throw errors;

        if (req.user.privileges == "admin" || req.params.userId == req.user.id) {
            const user = userModel.findById(req.params.userId, (err, user) => {
                if (err) {
                    res.status(401).json({ success: false, msg: 'Error on function' });
                    next();
                } else if (user) {
                    res.status(200).json({ success: true, msg: 'User found', user });
                    next();
                } else {
                    res.status(401).json({ success: false, msg: 'User not found' });
                    next();
                }
            });
        } else {
            res.status(401).json({ success: false, msg: 'User not found' });
            next();
        }
    } catch (err) {
        res.status(401).json({ "message": "Invalid credentials", "errors": err });
        next();
    }
    // next();
}

const _newUser = function (req, res, next) {

    try {
        req.checkBody("username", "Username invalid").notEmpty().withMessage("Username can't be empty").isAlphanumeric().withMessage('Username must contain letters and numbers only');
        const usernameParam = (req.body.username).toLowerCase();
        req.checkBody("email", "No email input").notEmpty().withMessage("Email can't be empty").isEmail().withMessage("Must be a valid email");
        const emailParam = (req.body.email).toLowerCase();
        req.checkBody("role", "No role input").notEmpty().withMessage("Role can't be empty");
        req.checkBody("password", "No password input").notEmpty().withMessage("Password can't be empty").len({ min: 7 }).withMessage("min 7 characters").isAlphanumeric().withMessage('Password must contain only letters and numbers ');


        const errors = req.validationErrors();
        if (errors) throw errors;

        if (req.user.privileges == "admin") {

            const newUser = new userModel({
                email: emailParam,
                username: usernameParam,
                password: req.body.password,
                role: req.body.role
            });

            newUser.save(function (err) {
                if (err) {
                    res.status(401).json({ success: false, msg: 'Error on function' });
                    next();
                } else {
                    res.status(200).json({ success: true, msg: 'User correctly created', newUser });
                    next();
                }
            });
        } else {
            res.status(401).json({ success: false, msg: 'User not created' });
            next();
        }
    } catch (err) {
        res.status(401).json({ "message": "Invalid credentials", "errors": err });
        next();
    }
}

const _updateUser = function (req, res, next) {

    const updates = req.body;

    if (req.user.privileges == "admin") {
        let result = null;
        userModel.updateUser(req.params.userId, query, (err, user) => {
            if (err) {
                res.status(401).json({ success: false, msg: 'Error on function', err });
                next();
            } else {
                res.status(200).json({ success: true, msg: 'User correctly updated', user });
                next();
            }
        });
    } else {
        res.status(401).json({ success: false, msg: 'User not updated' });
        next();
    }

}

const _updateProfile = function (req, res, next) {
    let fails = "";
    const updates = req.body;
    try {
        if (req.user.privileges == "admin" || req.user.id == req.params.userId) {
            Object.keys(updates).map(function (key, index) {
                if (key != "email" && key != "password" && key != "username" && key != "role") throw "invalid input";
                else if (key == "email") {
                    req.checkBody("email", "No email input").notEmpty().withMessage("Email can't be empty").isEmail().withMessage("Must be a valid email");
                    req.body.email = (req.body.email).toLowerCase();
                    Valid.find({ email: req.body.email }).limit(1).exec(function (err, docs) {
                        if (docs.length == 0) {
                            userModel.find({ email: req.body.email }).limit(1).exec(function (err, docs2) {
                                if (docs2.length == 0) {

                                } else {
                                    fails += "Email in use";
                                }
                            });
                        } else {
                            fails += "Email in use";
                        }
                    });
                } else if (key == "password") {
                    req.checkBody("password", "No password input").notEmpty().withMessage("Password can't be empty").len({ min: 7 }).withMessage("min 7 characters").isAlphanumeric().withMessage('Password must contain only letters and numbers ');
                } else if (key == "username") {
                    req.checkBody("username", "Username invalid").notEmpty().withMessage("Username can't be empty").isAlphanumeric().withMessage('Username must contain letters and numbers only');
                    req.body.username = (req.body.username).toLowerCase();
                    Valid.find({ username: req.body.username }).limit(1).exec(function (err, docs) {
                        if (docs.length == 0) {
                            userModel.find({ username: req.body.username }).limit(1).exec(function (err, docs2) {
                                if (docs2.length == 0) {

                                } else {
                                    fails += "Username in use";
                                }
                            });
                        } else {

                            fails += "Username in use";
                        }
                    });
                } else if (key == "role" && (updates.role == null || updates.role == "")) {
                    throw "Invalid role";
                }
            });

            setTimeout(function () {
                const errors = req.validationErrors();
                if (errors) {
                    res.status(401).json({ success: false, msg: 'User not updated', errors });
                    next();
                }
                if (fails) {
                    res.status(401).json({ success: false, msg: 'User not updated', fails });
                    next();
                }

                if (!errors && !fails) {
                    userModel.updateUser(req.params.userId, req.body, (err, user) => {
                        if (err) {
                            res.status(401).json({ success: false, msg: 'Error on function', err });
                            next();
                        } else {
                            res.status(200).json({ success: true, msg: 'User correctly updated', user });
                            next();
                        }
                    });
                }

            }, 1000);


        } else {
            res.status(401).json({ success: false, msg: 'User not updated' });
            next();
        }


    } catch (err) {
        res.status(401).json({ message: err });
        return (next);
    }

}

const _deleteUser = function (req, res, next) {
    if (req.user.privileges == "admin" || req.user.id == req.params.userId) {
        userModel.findByIdAndRemove({ _id: req.params.userId }, function (err, user) {
            if (err) {
                res.status(401).json({
                    success: false, msg: 'Failed to delete user' + err
                });
                next();
            } else if (user) {
                res.status(200).json({
                    success: true, msg: 'User correctly deleted', user
                });
                next();
            } else {
                res.status(401).json({
                    success: false, msg: 'User not found'
                });
                next();
            }
        });
    } else {
        res.status(401).json({
            success: false, msg: 'User not found'
        });
        next();
    }
}

const _listUsers = function (req, res, next) {
    console.log(req);
    if (req.user && req.user.privileges == "admin") {
        userModel.find({}, function (err, users) {
            if (err) {
                res.status(401).json({ success: false, msg: 'Failed to list users' + err });
                next();
            } else if (users.length > 0) {
                res.status(200).json({ success: true, msg: 'User', users });
                next();
            } else {
                res.status(401).json({ success: false, msg: 'No users to list' });
                next();
            }
        });
    } else {
        res.status(401).json({ success: false, msg: 'No users to list' });
        next();
    }
}


module.exports.getUser = _getUser;
module.exports.newUser = _newUser;
module.exports.updateUser = _updateUser;
module.exports.updateProfile = _updateProfile;
module.exports.deleteUser = _deleteUser;
module.exports.listUsers = _listUsers;