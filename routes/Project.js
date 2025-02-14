const express = require('express');
const router = express.Router();
const projectController = require('../controller/Project');
const authenticateToken = require('../midleware/authMidleware');

router.post('/createProject',authenticateToken,projectController.createProject);

module.exports = router;