// Country Schema
const mongoose = require('mongoose');

const AttachmentSchema = mongoose.Schema({
    url: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['Image', 'Book']
    }
}, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" }}  );

const Attachment = module.exports = mongoose.model('Attachment', AttachmentSchema);
