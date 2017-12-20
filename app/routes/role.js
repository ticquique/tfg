
var rolesController = require('../controllers/roles');

module.exports = function (router) {
    'use strict';
    // This will handle the url calls for /roles/:role_id
    router.route('/:roleId')
        .get(rolesController.getRoleFR)
        .put(rolesController.updateRoleFR)
        .delete(rolesController.deleteRoleFR);

    router.route('/')
        .get(rolesController.listRolesFR)
        .post(rolesController.newRoleFR);
};