const express = require('express');
const showLeadershipController=require('../controllers/premium');
const authenticateController = require('../middleware/auth');

const router = express.Router();


router.get('/show-leadership',authenticateController.authenticate,showLeadershipController.showLeadership);

module.exports=router;
