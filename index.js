// /index.js
'use strict';

// morgan:  HTTP request logger middleware for node.js
// nconf: configuration with files
// async: working with asynchronous JavaScript
// winston: Display logs
// body-parser: Parse incoming request bodies in a middleware before your handlers
// change-case: Convert strings
// require-dir: The directory's files are examined, and each one that can be require()'d
// dotenv: Dotenv is a zero-dependency module that loads environment variables from a .env file into process.env.
// mongoose: Mongodb abstract
// bluebird: promise library 
// uuid: random api key generator

var server = require('./config/initializers/server');
var nconf = require('nconf');
var async = require('async');
var logger = require('winston');

// Load Environment variables from .env file
require('dotenv').load();

// Set up configs
nconf.use('memory');
// First load command line arguments
nconf.argv();
// Load environment variables
nconf.env();
// Load config file for the environment
nconf.file('./config/enviroments/'+nconf.get("NODE_ENV")+'.json')

logger.info('[APP] Starting server initialization');


// Initialize Modules
async.series([
    function initializeDBConnection(callback) {
        require('./config/initializers/database')(callback);
    },
    function startServer(callback) {
        server(callback);
    }], function (err) {
        if (err) {
            logger.error('[APP] initialization failed', err);
        } else {
            logger.info('[APP] initialized SUCCESSFULLY');
        }
    }
);