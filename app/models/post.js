const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
        type: Schema.Types.ObjectId, required: false, rel: 'Attachment' ,
        required: true
    },
    creator: {
        type: Schema.Types.ObjectId, required: false, rel: 'User' ,
        require: true
    }
}, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" }}  );

const Post = module.exports = mongoose.model('Post', PostSchema);
