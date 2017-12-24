
var email = require('../mailer/mailModule');

module.exports = function (router) {
    'use strict';
    
    router.route('/')
        .post(email.mailFR);
};