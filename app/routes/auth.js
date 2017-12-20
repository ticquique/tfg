
var authController = require('../controllers/auth');

module.exports = function (router) {
    'use strict';
    // This will handle the url calls for /countries/:country_id
    router.route('/')
        .post(authController.login);

};
