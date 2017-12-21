const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const config = require('nconf');
const User = require('../models/user');

const _authenticate = expressJwt({
    secret: config.get('JWT_SECRET'),
});

const genToken = (user) => {
    let expires = 60*60*24*7;
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
module.exports.login = _login;