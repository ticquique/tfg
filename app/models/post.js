const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./user');
const Like = require('./like');
const Dislike = require('./dislike');

// Post Schema
const PostSchema = mongoose.Schema({
    title: {
        type: String,
        required: false
    },
    message: {
        type: String,
        required: false
    },
    attachments: {
        type: Schema.Types.ObjectId,
        required: false
    },
    creator: {
        type: Schema.Types.ObjectId,
        required: false,
        ref: 'User'
    },
    likes: [{
        type: Schema.Types.ObjectId,
        required: false,
        ref: 'Like'
    }],
    dislikes: [{
        type: Schema.Types.ObjectId,
        required: false,
        ref: 'Dislike'
    }]
}, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" }}  );

const Post = module.exports = mongoose.model('Post', PostSchema);
