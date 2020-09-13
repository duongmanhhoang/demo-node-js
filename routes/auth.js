const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const verifyToken = require('./../middlewares/verifyToken');
const router = express.Router();
const User = require('./../models/User');
const { registerValidator } = require('./../validations/auth');

router.post('/register', async (request, response) => {
    const { error } = registerValidator(request.body);

    if (error) return response.status(422).send(error.details[0].message);

    const checkEmailExist = await User.findOne({ email: request.body.email });

    if (checkEmailExist) return response.status(422).send('Email is exist');

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(request.body.password, salt);

    const user = new User({
        name: request.body.name,
        email: request.body.email,
        password: hashPassword,
    });

    try {
        const newUser = await user.save();
        await response.send(newUser);
    } catch (err) {
        response.status(400).send(err);
    }
});

router.post('/login', async (request, response) => {
    const user = await User.findOne({email: request.body.email});

    if (!user) return response.status(422).send({message: 'Email or Password is not correct'});

    const checkPassword = await bcrypt.compare(request.body.password, user.password);

    if (!checkPassword) return response.status(422).send({message: 'Email or Password is not correct'});

    const token = await jwt.sign({_id: user._id}, process.env.TOKEN_SECRET, { expiresIn: 60 * 60 * 24 });

    return response.status(200).send({
        token,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email
        },
        message: 'Login successfully'
    });
})

module.exports = router;
