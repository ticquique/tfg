
var userController = require('../controllers/users');
var auth = require('../controllers/auth');

module.exports = function (router) {
    'use strict';
    // This will handle the url calls for /users/:user_id
    router.route('/:userId')
        .get(userController.getUserFR)
        .put(userController.updateUserFR)
        .delete(userController.deleteUserFR);

    router.route('/')
        .get(userController.listUsersFR)
        .post(userController.newUserFR);


};