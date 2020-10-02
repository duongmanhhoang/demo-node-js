const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        min: 1,
        max: 255
    },
    order: {
        type: Number,
        required: true
    },
    created_by: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model('Category', CategorySchema);
