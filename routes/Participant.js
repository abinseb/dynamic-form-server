const express = require('express');
const router = express.Router();
const Participant = require('../model/Participant');
const multer = require('multer');



const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'uploads/');
    },
    filename:function(req,file,cb){
        cb(null,Date.now()+"--"+file.originalname);
    }
});

const upload = multer({storage:storage});


router.post('/saveParticipant',upload.single('resume'), async (req, res) => {
    try {
        const { dynamicFields } = req.body;
        console.log("participantdata",dynamicFields);
        const file = dynamicFields.file;
        console.log('file',file);

        const participantsData = new Participant({
            dynamicFields
        });

        const savedParticipants = await participantsData.save();
        res.json(savedParticipants);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
