const express = require('express');
const router = express.Router();
const userControler = require('../controller/User');
const validateUserData = require('../midleware/validationMidlware');


router.post('/userSignUp',validateUserData,userControler.userSignUp);
router.post('/userLogin',userControler.userLogin);

module.exports = router;