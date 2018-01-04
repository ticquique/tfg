const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

// Schema defines how chat messages will be stored in MongoDB
const FollowSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId, ref: 'User'
    },
    following: [{
        type: Schema.Types.ObjectId, ref: 'User'
    }]
});

module.exports = mongoose.model('Follow', FollowSchema);