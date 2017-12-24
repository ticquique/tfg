var countryModel = require('../models/country');

const _getCountry = function (id, callback) {
    let result = null;
    const country = countryModel.getCountryById(id, (err, country) => {
        if (err || country == null) {
            result = { success: false, msg: 'Country not found' }
        } else {
            result = { success: true, msg: 'Country found', country }
        }
        callback(result);
    });
}

const _getCountryByName = function (name, callback) {
    let result = null;
    const country = countryModel.getCountryByName(name, (err, country) => {
        if (err || country == null) {
            result = { success: false, msg: 'Country not found' }
        } else {
            result = { success: true, msg: 'Country found', country }
        }
        callback(result);
    });
}

const _getAllCountries = function (callback) {
    const countries = countryModel.getAllCountries((err, countries) => {
        if (err) {
            result = { success: false, msg: 'Failed in method listCountries' };
        } else {
            result = { success: true, msg: 'Correctly listed all countries', countries };
        }
        callback(result);
    });
}

const _getCountryCities = function (id, callback) {
    let result = null;
    const city = countryModel.getCountryCities(id, (err, cities) => {
        if (err || cities == null) {
            result = { success: false, msg: 'Cities not found' }
        } else {
            result = { success: true, msg: 'Cities found', cities }
        }
        callback(result);
    });
}


//FUNCTIONS TO ROUTES

const _getCountryFR = function (req, res, callback) {
    _getCountry(req.params.countryId, (country) => {
        res.json(country);
    });
}

const _getCountryCitiesFR = function (req, res, callback) {
    _getCountryCities(req.params.countryId, (country) => {
        res.json(country);
    });
}

const _listCountriesFR = function (req, res, callback) {
    if(req.query.name) {
        _getCountryByName(req.query.name, (country) => {
            res.json(country);
        });
    } else {
        _getAllCountries((result) => {
            res.json(result);
        })
    }
}

module.exports.getCountry = _getCountry;
module.exports.getCountryFR = _getCountryFR;
module.exports.getCountryByName = _getCountryByName;
module.exports.listCountries = _getAllCountries;
module.exports.listCountriesFR = _listCountriesFR;
module.exports.getCountryCities = _getCountryCities;
module.exports.getCountryCitiesFR = _getCountryCitiesFR;