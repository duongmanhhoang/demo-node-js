const express = require('express');
const verifyToken = require('./../middlewares/verifyToken');
const Task = require('./../models/Task');
const router = express.Router();

router.get('/', verifyToken, (request, response) => {
    Task.find({}).exec(function (err, tasks) {
        response.send(tasks);
    });
});

module.exports = router;
