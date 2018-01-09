
var schedule = require('node-schedule');
var config = require('nconf');
var Valid = require('../app/models/valid');

function start(cb) {
    setTimeout(function () {
        var j = schedule.scheduleJob({ hour: 02, minute: 30, dayOfWeek: 2 }, function () {
            Valid.find({
                createdAt : { $gte : new Date(+new Date - 1000 * 60 * 60 * 24 * 7)} 
            }, function(err, docs){
                console.log(docs);
            });
            console.log('Removing unused clients!');
        });

        if (cb) {
            return cb();
        }
    }, 20000)

}

module.exports = start;