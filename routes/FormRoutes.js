const express = require('express');
const router = express.Router();
const formController = require('../controller/FormCreateController');
const authenticateToken = require('../midleware/authMidleware');

router.post('/createForms', authenticateToken, formController.createForms);
router.get('/forms/:parentId', formController. getFormDataWithWidgets);
router.post('/updateform/:id', authenticateToken, formController.updateFormData);
router.get('/userformdata', authenticateToken, formController.getFormDataBasedOnUserId);
router.delete('/deletechildform/:childformId', authenticateToken, formController.deleteWidgets);
router.get('/parentFormdata/:id', authenticateToken, formController.getFormdataBasedOnId);
router.put('/responseState/:id', authenticateToken, formController.responseStateUpdate);
router.delete('/formdelete/:id', authenticateToken, formController.deleteFormData_withWidgets);


module.exports = router;