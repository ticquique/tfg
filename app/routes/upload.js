
var uploadController = require('../controllers/upload');

module.exports = function (router) {
    'use strict';
    // This will handle the url calls for /countries/:country_id
    router.route('/')
        .post(uploadController);

};