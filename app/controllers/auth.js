const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const config = require('nconf');
const User = require('../models/user');
const Valid = require('../models/valid');
const Email = require('../mailer/mailModule');
const fs = require('fs');
const path = require('path');

const _authenticate = expressJwt({
    secret: config.get('JWT_SECRET'),
});

const genToken = (user) => {
    let expires = 60 * 60 * 24 * 7;
    let token = jwt.sign({
        username: user.username,
        id: user._id,
        privileges: user.privileges
    }, config.get('JWT_SECRET'), {
            expiresIn: expires,
            subject: String(user._id)
        });

    return {
        token: token,
        expires: expires
    };
}

const _register = async (req, res, next) => {
    try {

        req.checkBody("username", "Username invalid").notEmpty().withMessage("Username can't be empty").isAlphanumeric().withMessage('Username must contain letters and numbers only');
        var usernameParam = (req.body.username).toLowerCase();
        req.checkBody("email", "No email input").notEmpty().withMessage("Email can't be empty").isEmail().withMessage("Must be a valid email");
        var emailParam = (req.body.email).toLowerCase();
        req.checkBody("role", "No role input").notEmpty().withMessage("Role can't be empty");

        let errors = req.validationErrors();
        if (errors) throw errors;
        let valErrors = "";

        function randomPassword(length) {
            chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
            pass = "";
            for (x = 0; x < length; x++) {
                i = Math.floor(Math.random() * 62);
                pass += chars.charAt(i);
            }
            return pass;
        }

        var password = randomPassword(25);

        var token = randomPassword(25);

        const url = config.get('apiURL') + "auth/" + token;

        const valid = new Valid({
            email: emailParam,
            username: usernameParam,
            token: token,
            password: password,
            role: req.body.role,
            vars: req.body.vars
        });

        Valid.find({
            $or: [{ email: emailParam }, { username: usernameParam }]
        }).limit(1).exec(function (err, docs) {
            if (docs.length == 0) {
                User.find({
                    $or: [{ email: emailParam }, { username: usernameParam }]
                }).limit(1).exec(function (err, docs2) {
                    if (docs2.length == 0) {
                        valid.save(function (err, validData) {
                            if (err) {
                                throw new Error(err);
                            } else if (validData) {
                                let success = Email.mail("checkMailWelcome", {
                                    to: emailParam,
                                    name: usernameParam,
                                    url: url,
                                    password: password
                                });

                                if (success === false) valErrors = "Email not sent";

                                if (valErrors) {
                                    res.status(401).json({ message: valErrors });
                                    return (next);
                                }

                                res.status(200).json({ message: "you will receive an email to verify it, follow the link that is inside" });
                                return (next);
                            }

                        });
                    } else {
                        if (docs2[0].email == emailParam && docs2[0].username == usernameParam) {
                            valErrors = 'User already registered, if you don´t remember your password go to "Password recovery" section';
                        } else if (docs2[0].email == emailParam) {
                            valErrors = 'Email already in use';
                        } else {
                            valErrors = 'Username already in use';
                        }
                        res.status(401).json({ message: valErrors });
                        return (next);
                    }
                });
            } else {
                if (docs[0].email == emailParam && docs[0].username == usernameParam) {
                    valErrors = 'User already registered, please confirm the email, search in your inbox "Welcome to Inarts", if you dont find it click the next button';
                } else if (docs[0].email == emailParam) {
                    valErrors = 'Email already in use';
                } else {
                    valErrors = 'Username already in use';
                }
                res.status(401).json({ message: valErrors });
                return (next);
            }
        });

    } catch (err) {
        res.status(401).json({ "message": "Invalid credentials", "errors": err });
    }
}

const _validate = async (req, res, next) => {
    try {
        req.checkParams("token", "Token not valid").notEmpty().withMessage("Token can't be empty").isAlphanumeric().withMessage('Token not valid');
        let errors = req.validationErrors();
        if (errors) throw errors;

        Valid.findOneAndRemove({ token: req.params.token }).exec(function (err, doc) {
            if (err) {
                res.status(401).json({ message: err });
                return (next);
            } else if (doc) {
                let user = new User({
                    email: doc.email,
                    username: doc.username,
                    password: doc.password,
                    role: doc.role
                });
                user.save(function (err) {
                    if (err) {
                        res.status(401).json({ message: err });
                        return (next);
                    } else {
                        const pathfile = path.join(config.get('PWD'), config.get('uploadPath'), doc.username);
                        if (!fs.existsSync(pathfile)) {
                            fs.mkdirSync(pathfile);
                        }
                        res.status(200).json(genToken(user));
                        return (next);
                    }
                })
            } else {
                res.status(401).json({ message: "Not valid code provided" });
                return (next);
            }
        });

    } catch (err) {
        res.status(401).json({ message: err });
        return (next);
    }
}

const _login = async (req, res) => {
    try {
        req.checkBody("username", "Invalid username").notEmpty();
        req.checkBody("password", "Invalid password").notEmpty();
        var usernameParam = (req.body.username).toLowerCase();

        let errors = req.validationErrors();

        if (errors) throw errors;

        let user = await User.findOne({ "username": usernameParam }).exec();

        if (user === null) throw "User not found";

        let success = await user.comparePassword(req.body.password);

        if (success === false) throw "";

        res.status(200).json(genToken(user));

    } catch (err) {
        res.status(401).json({ "message": "Invalid credentials", "errors": err });
    }
}

module.exports.authenticate = _authenticate;
module.exports.register = _register;
module.exports.validate = _validate;
module.exports.login = _login;