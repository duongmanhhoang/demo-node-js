const express = require('express');
const mongoose = require('mongoose');
const verifyToken = require('./../middlewares/verifyToken');
const Task = require('./../models/Task');
const Category = require('./../models/Category');
const router = express.Router();

const dragAndDropWhenCategoryChange = async (category, tasks, taskId = null) => {
    const tasksId = await tasks.map(task => task._id);
    await Category.findOneAndUpdate({ _id: category._id }, { tasks: tasksId });
    tasks.forEach(async (task) => {
        let data = { order: task.order }
        
        if (task === taskId) {
            data = {
                order: task.order,
                category: category
            };
        }
        await Task.findOneAndUpdate(
            { _id: task._id },
            data
        );
    });
};

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
    const { currentCategoryId, dropedCategoryId, taskId, newIndex, newCategoriesData } = request.body;

    if (currentCategoryId == dropedCategoryId) {
        const category = await newCategoriesData.find(item => item._id == currentCategoryId);
        const { tasks } = category;
        tasks.forEach(async (task) => {
            await Task.findOneAndUpdate(
                { _id: task._id },
                { order: task.order }
            )
        })
    } else {
        const currentCategory = await newCategoriesData.find(item => item._id == currentCategoryId);
        const newCategory = await newCategoriesData.find(item => item._id == dropedCategoryId);
        const currentTasks = currentCategory.tasks;
        const newTasks = newCategory.tasks;
        dragAndDropWhenCategoryChange(currentCategory, currentTasks);
        dragAndDropWhenCategoryChange(newCategory, newTasks, taskId);
    }
    
    const categories = await Category.find({ created_by: request.userID }).populate({
        path: 'tasks',
        options: { sort: 'order' }
    }).sort('order').exec();

    return response.status(200).send(categories);
});

router.post('/update/:id', verifyToken, async (request, response) => {
    const { id } = request.params;
    await Task.findByIdAndUpdate(id, { title: request.body.title });
    const task = await Task.findById(id);

    return response.status(200).send(task);
});

module.exports = router;
