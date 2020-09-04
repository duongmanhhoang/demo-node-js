const express = require('express');
const verifyToken = require('./../middlewares/verifyToken');
const User = require('./../models/User');
const router = express.Router();

router.get('/', verifyToken, (request, response) => {
    User.find({}).exec(function (err, users) {
        response.send(users);
    });
});

module.exports = router;
