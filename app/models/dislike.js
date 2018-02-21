const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Dislike Schema
const DislikeSchema = mongoose.Schema({
    related: {
        type: Schema.Types.ObjectId, required: false ,
        required: false,
        index: true
    },
    user: {
        type: Schema.Types.ObjectId, required: false, rel: 'User' ,
        required: false,
        index: true
    },
    relatedUp: {
        type: Boolean,
        required: false,
        default: true
    }
}, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" }}  );

const Dislike = module.exports = mongoose.model('Dislike', DislikeSchema);
