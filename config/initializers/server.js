

// config/initializers/server.js

var express = require('express');
var path = require('path');
var fs = require('fs');
// Local dependecies
var config = require('nconf');

// create the express app
// configure middlewares
var bodyParser = require('body-parser');
var expressValidator = require("express-validator");
var morgan = require('morgan');
var logger = require('winston');
var helmet = require('helmet');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var https = require('https');
var cors = require('cors');
var auth = require("../../app/controllers/auth");
var app;

var start = function (cb) {
    'use strict';
    // Configure express 
    var options = {
        key: fs.readFileSync(path.join(config.get('PWD'), config.get('NODE_SSL_KEY'))),
        cert: fs.readFileSync(path.join(config.get('PWD'), config.get('NODE_SSL_CERT')))
    };
    var corsOptions = {
        origin: function (origin, callback) {
            if(config.get('whitelist').origin !== -1) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed'));
            }
        }
    }
    app = express();

    app.use(cors(corsOptions));
    app.use(favicon(path.join(config.get('PWD'), 'public', 'favicon', 'favicon.ico')))
    app.use(helmet());
    app.use(cookieParser());
    app.disable('x-powered-by');
    app.use(morgan('common'));
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json({ type: '*/*' }));
    app.use(expressValidator({
        customValidators: {
            isArray: function (value) {
                return Array.isArray(value);
            }
        }
    }));
    app.use(auth.initialize());
    
    app.all('*', (req, res, next) => {
        if (req.path.includes("/api/auth")) return next();

        return auth.authenticate((err, user, info) => {
            if (err) { return next(err); }
            if (!user) {
                if (info.name === "TokenExpiredError") {
                    return res.status(401).json({ message: "Your token has expired. Please generate a new one" });
                } else {
                    return res.status(401).json({ message: info.message });
                }
            }
            app.set("user", user);
            return next();
        })(req, res, next);

    });

    logger.info('[SERVER] Initializing routes');
    require('../../app/routes/index')(app);

    app.use(express.static(path.join(__dirname, 'public')));

    // Error handler
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.json({
            message: err.message,
            error: (app.get('env') === 'development' ? err : {})
        });
        next(err);
    });

    https.createServer(options, app).listen(config.get('NODE_PORT'));
    logger.info('[SERVER] Listening on port ' + config.get('NODE_PORT'));

    if (cb) {
        return cb();
    }
};

module.exports = start;

