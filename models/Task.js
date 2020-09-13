const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 1,
        max: 255
    },
    tag_id: {
        type: Number,
        required: true
    },
    detail: {
        type: String
    },
    assign_to: {
        type: Number
    },
    created_by: {
        type: Number,
        required: true,
    }
});

module.exports = mongoose.model('Task', TaskSchema);
