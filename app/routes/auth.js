
var authController = require('../controllers/auth');

module.exports = function (router) {
    'use strict';

    router.route('/')
        .post(authController.login);
    
    router.route('/register')
        .post(authController.register);

    router.route('/:token')
        .get(authController.validate);

};
