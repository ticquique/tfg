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
    }
});

const Country = module.exports = mongoose.model('Country', CountrySchema);


const _getCountryByName = function (countryName, callback) {
    Country.findOne({name: countryName}, callback);
}

const _getCountryById = function (id, callback) {
    Country.findById(id, callback);
}

const _getAllCountries = function (callback) {
    return Country.find({}, callback);
}

module.exports.getAllCountries = _getAllCountries;
module.exports.getCountryByName = _getCountryByName;
module.exports.getCountryById = _getCountryById;