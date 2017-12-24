const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
var cities = require('./files/countryCities.json');

// Connection URL
const url = "mongodb://ailez:RaFlKQWwv9NwZX5A@cluster0-shard-00-00-gr7ru.mongodb.net:27017,cluster0-shard-00-01-gr7ru.mongodb.net:27017,cluster0-shard-00-02-gr7ru.mongodb.net:27017/inarts?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin";

// Database Name
const dbName = 'inarts';

const countries = [];
let counter = 1;

// Use connect method to connect to the server
MongoClient.connect(url, function (err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    const db = client.db(dbName);
    extractCountries((result) => {
        insertDocuments(db, result, function () {
            client.close();
        });
    })
});

const insertDocuments = function (db, result, callback) {
    // Get the documents collection
    const collection = db.collection('countries');
    // Insert some documents
    collection.insertMany(result, function (err, result) {
        console.log("Inserted " + result.ops.length + " documents into the collection");
        callback(result);
    });
}

function extractCountries(callback) {
    var lineReader = require('readline').createInterface({
        input: require('fs').createReadStream('./files/countries.txt')
    });

    lineReader.on('line', function (line) {
        if (counter == 1) {
            counter--;
        } else {
            var stringArr = line.match(/\S+/g);
            const iso = stringArr[1];
            const name = line.substr(line.indexOf(stringArr[3]));
            const country = {
                "iso": iso,
                "name": name
            }
            if(cities.countries[name] && cities.countries[name][0] !== undefined){
                country.cities = cities.countries[name];
            } else {
                country.cities = [];
            }
            console.log(country);
            countries.push(country);
        }
    });

    lineReader.on('close', function () {
        callback(countries);
    });
}
