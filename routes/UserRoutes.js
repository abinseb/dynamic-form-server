const express = require('express');
const router = express.Router();
const userControler = require('../controller/User');
const validateUserData = require('../midleware/validationMidlware');

// post api for formcreated user signup
router.post('/userSignUp',validateUserData,userControler.userSignUp);

// post api for login formcreating user
router.post('/userLogin',userControler.userLogin);

module.exports = router;