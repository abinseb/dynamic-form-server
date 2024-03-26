const express = require('express');
const router = express.Router();
const registrationControler = require('../controller/Participant');
const uploadMiddleware = require('../midleware/uploadMidleWare');
const authenticateToken = require('../midleware/authMidleware');

// post api for register the dynamicaly created form , here the file handling middleware 
// for handle the files, if it have any files.
router.post('/saveParticipant',uploadMiddleware.any(),registrationControler.saveParticipants);

// it is get api for fetching all the registration details of the form based on the formId
router.get('/registration/:id',authenticateToken,registrationControler.fetchRegistration);

// this get api for fetch the files from the backed based on th eunique filename
router.get('/files/:filename',registrationControler.fetchFile);
module.exports = router;

