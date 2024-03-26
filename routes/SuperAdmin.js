const express = require('express');
const router = express.Router();
const {fetchAllFormData, adminSignUp,AdminLogin,adminTokenVerify} = require('../controller/SuperAdmin');

// this get api for the fectching all form data and created user data for the supper admin
router.get('/fetch_allform',fetchAllFormData);

// sign up post api for supper admin
router.post('/admin-signup',adminSignUp);

// login post api for the supper admin
router.post('/admin-login',AdminLogin);

// token verification of supper admin , 
router.post('/admin-token-verify',adminTokenVerify);


module.exports = router;
