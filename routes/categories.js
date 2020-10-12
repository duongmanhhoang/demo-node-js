const express = require('express');
const mongoose = require('mongoose');
const verifyToken = require('./../middlewares/verifyToken');
const Category = require('./../models/Category');
const Task = require('./../models/Task');
const router = express.Router();

router.get('/', verifyToken, async (request, response) => {
    const userId = request.userID;
    const data = await Category.find({created_by: userId}).populate({
        path: 'tasks',
        model: 'Task',
        options: {sort: 'order'}
    }).sort('order').exec();

    await response.send(data);
});

router.post('/create', verifyToken, async (request, response) => {
    const category = new Category({
        _id: new mongoose.Types.ObjectId(),
        title: request.body.title,
        created_by: request.body.created_by,
        order: request.body.order
    });

    try {
        const newCategory = await category.save();
        await response.send(newCategory);
    } catch (err) {
        response.status(400).send(err);
    }
})

module.exports = router;
