const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Like Schema
const LikeSchema = mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId, required: false, rel: 'User' ,
        required: false,
        index: true,
    },
    related: {
        type: Schema.Types.ObjectId, required: false ,
        required: false,
        index: true,
    },
    relatedUp: {
        type: Boolean,
        required: false,
        default: true
    }
}, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" }}  );


const Like = module.exports = mongoose.model('Like', LikeSchema);
