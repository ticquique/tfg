const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Country Schema
const CountrySchema = mongoose.Schema({
    iso: {
        type: String,
        required: true,
        maxlength: 2
    },
    name: {
        type: String,
        required: true
    },
    cities: {
        type: [String],
        required: false
    }
});

const Country = module.exports = mongoose.model('Country', CountrySchema);


const _getCountryByName = function (countryName, callback) {
    return Country.findOne({name: countryName}, 'name', callback);
}

const _getCountryById = function (id, callback) {
    return Country.findById(id, 'name', callback);
}

const _getCountryCities = function (id, callback) {
    return Country.findById(id, 'cities', callback);
}

const _getAllCountries = function (callback) {
    return Country.find({}, 'name', callback);
}

module.exports.getAllCountries = _getAllCountries;
module.exports.getCountryByName = _getCountryByName;
module.exports.getCountryById = _getCountryById;
module.exports.getCountryCities = _getCountryCities;