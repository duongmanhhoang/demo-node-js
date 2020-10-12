const express = require('express');
const mongoose = require('mongoose');
const verifyToken = require('./../middlewares/verifyToken');
const Task = require('./../models/Task');
const Category = require('./../models/Category');
const router = express.Router();

router.get('/', verifyToken, (request, response) => {
    Task.find({}).exec(function (err, tasks) {
        response.send(tasks);
    });
});

router.post('/', verifyToken, async (request, response) => {
    const category = await Category.findOne({ _id: request.body.category }).populate('tasks').exec();
    const tasks = await category.tasks;
    let nextOrder = 0;

    if (tasks.length) {
        const orderList = tasks.map(item => item.order).sort();
        nextOrder = Math.max(Math.max(...orderList)) + 1;
        console.log(orderList.length, nextOrder);
    }

    const task = await new Task({
        _id: new mongoose.Types.ObjectId(),
        title: request.body.title,
        category: request.body.category,
        created_by: request.userID,
        order: nextOrder
    });

    await task.save(async (err, task) => {
        if (err) {
            console.error(err);
            return;
        }

        await tasks.push(task._id);
        await Category.findOneAndUpdate({ _id: category._id }, {
            tasks
        });

        return response.status(200).send(task)
    })
})

router.post('/drag-and-drop', verifyToken, async (request, response) => {
    const { categoryId, taskId, newIndex } = request.body;
    const task = await Task.findOne({ _id: taskId }).exec();
    const oldCategory = await Category.findOne({ _id: task.category }).exec();
    const newCategory = await Category.findOne({ _id: categoryId }).populate({
        path: 'tasks',
        match: {
            order: { $gte: newIndex },
            _id: { $ne: taskId }
        },
        options: {
            sort: { 'order': 1 }
        }
    }).exec();
    const newCategoryForAllTasks = await Category.findOne({ _id: categoryId }).populate('tasks').exec();
    const tasksCategory = newCategory.tasks;
    await tasksCategory.forEach(async (item) => {
        const newOrder = item.order + 1;
        await Task.findOneAndUpdate(
            { _id: item._id },
            { order: newOrder }
        )
    });
    await Task.findOneAndUpdate(
        { _id: taskId },
        { order: newIndex, category: categoryId }
    );
    
    if (oldCategory._id != newCategory._id) {
        let oldCategoryTasks = await oldCategory.tasks;
        oldCategoryTasks = await oldCategoryTasks.filter(item => item != taskId);
        await Category.findOneAndUpdate(
            { _id: oldCategory._id },
            { tasks: oldCategoryTasks }
        );
        oldCategoryTasks.forEach(async (item, index) => {
            await Task.findOneAndUpdate(
                { _id: item },
                { order: index }
            )
        });
        const newCategoryTasksId = newCategoryForAllTasks.tasks;
        await newCategoryTasksId.push(taskId);
        await Category.findOneAndUpdate(
            { _id: newCategory._id },
            { tasks: newCategoryTasksId }
        );
    }
    
    const categories = await Category.find({ created_by: request.userID }).populate({
        path: 'tasks',
        options: { sort: 'order' }
    }).sort('order').exec();

    return response.send(categories);
});

const updateWhenMoveSameCategory = () => {

}

module.exports = router;
