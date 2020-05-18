const express = require('express');
const authController = require('../controllers/auth');
const usersController = require('../controllers/users');

const router = express.Router();

router.post('/login', authController.loginUser);
router.post('/refresh', authController.refreshTokenVerify);

// secure router
router.get('/users', authController.accessTokenVerify, usersController.getUserList);
router.post('/register', authController.accessTokenVerify, authController.createUser);


module.exports = router;
