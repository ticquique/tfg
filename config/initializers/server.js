

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
var app;

var start = function (cb) {
    'use strict';
    // Configure express 
    var options = {
        key: fs.readFileSync(path.join(config.get('PWD'), config.get('NODE_SSL_KEY'))),
        cert: fs.readFileSync(path.join(config.get('PWD'), config.get('NODE_SSL_CERT')))
    };

    var auth = require("../../app/controllers/auth");
    var corsOptions = {
        origin: function (origin, callback) {
            if (config.get('whitelist').origin !== -1) {
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

