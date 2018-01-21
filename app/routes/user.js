
var userController = require('../controllers/users');
var auth = require('../controllers/auth');

module.exports = function (router) {
    'use strict';
    // This will handle the url calls for /users/:user_id
    router.route('/:userId')
        .get(userController.getUser)
        .put(userController.updateProfile)
        .delete(userController.deleteUser);

    router.route('/')
        .get(userController.listUsers)
        .post(userController.newUser);


};