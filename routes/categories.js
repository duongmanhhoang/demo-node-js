const express = require('express');
const verifyToken = require('./../middlewares/verifyToken');
const Category = require('./../models/Category');
const router = express.Router();

router.get('/', verifyToken, (request, response) => {
    Category.find({}).exec(function (err, categories) {
        response.send(categories);
    });
});

router.post('/create', verifyToken, async (request, response) => {
    const category = new Category({
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
