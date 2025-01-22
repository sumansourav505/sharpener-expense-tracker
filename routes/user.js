const express = require('express');
const userController = require('../controllers/user');
const purchaseController=require('../controllers/purchase');
const authenticateController=require('../middleware/auth');

const router = express.Router();

// Routes for user operations
router.get('/status', authenticateController.authenticate, purchaseController.getUserStatus);
router.post('/signup', userController.signup);
router.post('/login', userController.login);
//router.post('/password/forgotpassword', userController.forgotPassword);

module.exports = router;
