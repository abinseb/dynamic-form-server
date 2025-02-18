const express = require('express');
const router = express.Router();
const formController = require('../controller/FormCreateController');
const authenticateToken = require('../midleware/authMidleware');

const uploadFileMiddleware = require('../midleware/uploadTitleFile');

// this post api is used to create the dynamic form and widgets
router.post('/createForms', authenticateToken, uploadFileMiddleware.single('formTitleImage'), formController.createForms);

// this get api is for fetching the form details and its corresponding widgets
router.get('/forms/:parentId', formController. getFormDataWithWidgets);

// update the dynamicaly created form data and its corresponding widgets
router.post('/updateform/:id', authenticateToken,uploadFileMiddleware.single('formTitleImage'), formController.updateFormData);

// fetch the dynamicaly created forms data(parent form data) of the user(based on the userId)
router.post('/userformdata',authenticateToken, formController.getFormDataBasedOnUserId);

// this api is used to delete the widgets of the form
router.delete('/deletechildform/:childformId', authenticateToken, formController.deleteWidgets);

// get api for fetching the parent form data based on the formId (single form data)
router.get('/parentFormdata/:id', formController.getFormdataBasedOnId);

//  this api is used to control the form response (controle the publish status)
router.put('/responseState/:id',authenticateToken, formController.responseStateUpdate);

// delete the form and delete the widgets
router.delete('/formdelete/:id', authenticateToken, formController.deleteFormData_withWidgets);

// remove the form data by a post api, here we are update the status === '2',
router.post('/removeForm/:id' , formController.removeTheFormData);


module.exports = router;
