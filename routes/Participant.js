const express = require('express');
const router = express.Router();
const Participant = require('../model/Participant');
const multer = require('multer');
const path = require('path'); // Add this line to include the 'path' module

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../upload')); // Use path.join to get the absolute path
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now()+'-'+Math.round(Math.random() *1e9);
        cb(null, uniqueSuffix + file.originalname);
    }
});

const upload = multer({ storage:storage });

router.post('/saveParticipant', upload.any(), async (req, res) => {
    try {
       
        const dynamicFields = JSON.parse(req.body.dynamicFields);
        const participantdata = dynamicFields.participantdata;
        const form_id = dynamicFields.form_id;
        // const form_id = req.body.dynamicFields.form_id;
        const files = req.files;
     
        // to create the object of the model and store these data to mongodb server
        const newParticipantData = new Participant({
            
            dynamicFields:{
                userData:participantdata,
                form_id:form_id,
                files: files.map(file=>({filename:file.filename , path:file.path}))
            }

        })

        // save data to  mongo 
        await newParticipantData.save();
      
        console.log('DynamicField Data:', dynamicFields);
        console.log('Participant Data:', participantdata);
        console.log('Form ID:', form_id);
        console.log('Files:', files);
        // res.send('Upload Successfully');
        res.status(200).json({ message: 'Data and files received successfully.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
