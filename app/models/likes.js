const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Post Schema
const PostSchema = mongoose.Schema({
    related: {
        type: Schema.Types.ObjectId, required: false ,
        required: false,
        index: true
    },
    user: {
        type: Schema.Types.ObjectId, required: false, rel: 'User' ,
        required: false,
        index: true
    }
}, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" }}  );

const Post = module.exports = mongoose.model('Post', PostSchema);
