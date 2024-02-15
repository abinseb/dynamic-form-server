const express = require('express');
const router = express.Router();
const registrationControler = require('../controller/Participant');
const uploadMiddleware = require('../midleware/uploadMidleWare');
const authenticateToken = require('../midleware/authMidleware');

router.post('/saveParticipant',uploadMiddleware.any(),registrationControler.saveParticipants);
router.get('/registration/:id',authenticateToken,registrationControler.fetchRegistration);

module.exports = router;

