const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
    _id: Schema.Types.ObjectId,
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
    },
    tasks: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Task'
        }
    ]
});

module.exports = mongoose.model('Category', CategorySchema);
