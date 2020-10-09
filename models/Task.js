const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TaskSchema = new Schema({
    _id: Schema.Types.ObjectId,
    title: {
        type: String,
        required: true,
        min: 1,
        max: 255
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category'
    },
    created_by: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model('Task', TaskSchema);
