const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const config = require('nconf');
const User = require('../models/user');
const Email = require('../mailer/mailModule');

const _authenticate = expressJwt({
    secret: config.get('JWT_SECRET'),
});

const genToken = (user) => {
    let expires = 60 * 60 * 24 * 7;
    let token = jwt.sign({
        username: user.username,
        id: user._id
    }, config.get('JWT_SECRET'), {
            expiresIn: expires,
            subject: String(user._id)
        });

    return {
        token: token,
        expires: expires
    };
}

const _register = async (req, res) => {
    try {

        req.checkBody("username", "Username invalid").notEmpty().withMessage("Username can't be empty").isAlphanumeric().withMessage('Username must contain letters and numbers only');
        req.checkBody("email", "No email input").notEmpty().withMessage("Email can't be empty").isEmail().withMessage("Must be a valid email");

        let errors = req.validationErrors();
        if (errors) throw errors;

        function randomPassword(length) {
            chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
            pass = "";
            for (x = 0; x < length; x++) {
                i = Math.floor(Math.random() * 62);
                pass += chars.charAt(i);
            }
            return pass;
        }

        var a = randomPassword(25);

        const url = config.get('apiURL') + "auth/" + a;

        

        // let success = Email.mail("checkMailWelcome", {
        //     to: req.body.email,
        //     name: req.body.username,
        //     url: url
        // });

        // if (success === false) throw "Email not sent";

        res.status(200).json({ message: "you will receive an email to verify it, follow the link that is inside" });


    } catch (err) {
        res.status(401).json({ "message": "Invalid credentials", "errors": err });
    }
}

const _validate = async (req, res) => {
    try {

    } catch (err) {

    }
}

const _login = async (req, res) => {
    try {
        req.checkBody("username", "Invalid username").notEmpty();
        req.checkBody("password", "Invalid password").notEmpty();

        let errors = req.validationErrors();

        if (errors) throw errors;

        let user = await User.findOne({ "username": req.body.username }).exec();

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