const jwt = require('jwt-simple');
const passport = require('passport');
const moment = require('moment');
const Strategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const config = require('nconf');
const User = require('../models/user');

const _initialize = () => {
    passport.use("jwt", getStrategy());
    return passport.initialize();
}

const _authenticate = (callback) => passport.authenticate("jwt", { session: false, failWithError: true }, callback);

const genToken = (user) => {
    let expires = moment().utc().add({ days: 7 }).unix();
    let token = jwt.encode({
        exp: expires,
        username: user.username
    }, config.get('JWT_SECRET'));

    return {
        token: "JWT " + token,
        expires: moment.unix(expires).format(),
        user: user._id
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

        let success = await user.comparePassword(req.body.password, () => {
            return;
        });
        if (success === false) throw "";

        res.status(200).json(genToken(user));
    } catch (err) {
        res.status(401).json({ "message": "Invalid credentials", "errors": err });
    }
}

const getStrategy = () => {
    const params = {
        secretOrKey: config.get('JWT_SECRET'),
        jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt'),
        passReqToCallback: true
    };

    return new Strategy(params, (req, payload, done) => {
        User.findOne({ "username": payload.username }, (err, user) => {
            if (err) {
                return done(err);
            }
            if (user === null) {
                return done(null, false, { message: "The user in the token was not found" });
            }

            return done(null, { _id: user._id, username: user.username });
        });
    });
}

module.exports.initialize = _initialize;
module.exports.authenticate = _authenticate;
module.exports.login = _login;