const express = require('express');
const verifyToken = require('./../middlewares/verifyToken');
const Task = require('./../models/Task');
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
        title: request.body.title,
        category_id: request.body.category_id,
        created_by: request.userID
    });
    await task.save((err, task) => {
        if(err){
            console.error(err);
            return;
        }
        return response.status(200).send(task)
    })
})

module.exports = router;
