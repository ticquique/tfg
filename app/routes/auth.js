
var authController = require('../controllers/auth');

module.exports = function (router) {
    'use strict';

    router.route('/')
        .post(authController.login)
        .get (authController.isAuthenticated);
    
    router.route('/register')
        .post(authController.register);

    router.route('/recover')
        .post(authController.recoverPassword);

    router.route('/recover/:token')
        .get(authController.validateRecoverPassword);

    router.route('/:token')
        .get(authController.validate);

};
