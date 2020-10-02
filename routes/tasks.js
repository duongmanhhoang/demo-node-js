const express = require('express');
const verifyToken = require('./../middlewares/verifyToken');
const Task = require('./../models/Task');
const router = express.Router();

router.get('/', verifyToken, (request, response) => {
    Task.find({}).exec(function (err, tasks) {
        response.send(tasks);
    });
});

router.post('/', verifyToken, (request, response) => {
    if(!request.isLoggedIn){
        response.status(401).send({message: 'Access Denied'});
    }
    const task = new Task({
        name: request.body.name,
        tag_id: request.body.tag_id,
        detail: request.body.detail,
        assign_to: request.body.assign_to,
        created_by: request.userID
    });
    task.save((err, task) => {
        if(err){
            console.error(err);
            return;
        }
        response.send(task)
    })
})

module.exports = router;
