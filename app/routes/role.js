
var rolesController = require('../controllers/roles');
var auth = require('../controllers/auth');

module.exports = function (router) {
    'use strict';
    // This will handle the url calls for /roles/:role_id
    router.route('/:roleId')
        .get(rolesController.getRole)
        .put(rolesController.updateRole)
        .delete(rolesController.deleteRole);

    router.route('/')
        .get(rolesController.getAllRoles)
        .post(rolesController.newRole);
};