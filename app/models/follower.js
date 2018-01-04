const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

// Schema defines how chat messages will be stored in MongoDB
const FollowerSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId, ref: 'User'
    },
    followedby: [{
        type: Schema.Types.ObjectId, ref: 'User'
    }]
});

module.exports = mongoose.model('Follower', FollowerSchema);