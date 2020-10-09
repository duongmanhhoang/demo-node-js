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
    if(!request.isLoggedIn){
        return response.status(401).send({message: 'Access Denied'});
    }

    const task = await new Task({
        _id: new mongoose.Types.ObjectId(),
        title: request.body.title,
        category: request.body.category,
        created_by: request.userID
    });

    await task.save(async (err, task) => {
        if(err){
            console.error(err);
            return;
        }
        const category = await Category.findOne({_id: request.body.category}).exec();
        const tasks = await category.tasks;
        await tasks.push(task._id);
        await Category.findOneAndUpdate({_id: category._id}, {
            tasks
        });

        return response.status(200).send(task)
    })
})

module.exports = router;
