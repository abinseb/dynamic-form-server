const express = require('express');
const router = express.Router();
const projectController = require('../controller/Project');
const authenticateToken = require('../midleware/authMidleware');

router.post('/createProject',projectController.validateProject,authenticateToken,projectController.createProject);
router.get('/getallProjects',authenticateToken,projectController.fetchAllProjects);

module.exports = router;