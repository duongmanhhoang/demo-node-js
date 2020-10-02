const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        min: 1,
        max: 255
    },
    category_id: {
        type: String,
        required: true
    },
    created_by: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model('Task', TaskSchema);
