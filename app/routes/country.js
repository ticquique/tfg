
var countriesController = require('../controllers/countries');

module.exports = function (router) {
    'use strict';
    // This will handle the url calls for /countries/:country_id
    router.route('/:countryId')
        .get(countriesController.getCountryFR);

    router.route('/:countryId/cities')
        .get(countriesController.getCountryCitiesFR);

    router.route('/')
        .get(countriesController.listCountriesFR);
};