

// config/initializers/database.js
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var config = require('nconf');

module.exports = function (cb) {
    'use strict';

    mongoose.connect(config.get('database'), {
        useMongoClient: true,
        autoIndex: false
    });
    // On Connection
    mongoose.connection.on('connected', () => {
        console.log('Connected to database ' + config.get('database'));
    });

    // On Error
    mongoose.connection.on('error', (err) => {
        console.log('Database error: ' + err);
    });
    
    // Initialize the component here then call the callback
    // More logic
    //
    // Return the call back
    cb();
};

