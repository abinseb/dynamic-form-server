const express = require('express');
const router = express.Router();
const Participant = require('../model/Participant');
const multer = require('multer');
const path = require('path'); // Add this line to include the 'path' module
const {ChildForm} = require('../model/FormCreation');
// const authenticateToken = require('../midleware/authMidleware');
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
        const participantdata = dynamicFields.registration;
        const form_id = dynamicFields.form_id;
        // const form_id = req.body.dynamicFields.form_id;
        const files = req.files;
     
         // fetch the whole widget data based on the formid for proper validation
         const childForms = await FetchtheWidgets(form_id);
        
        //  validate the data
        await validateTheFormData(participantdata,childForms);
        // to create the object of the model and store these data to mongodb server
       await  validateTheUniqueValues(participantdata,childForms,form_id)
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
       if(error.message === 'ValidationError'){
        res.status(422).json({validationError:error.message});
       }
       else{
        res.status(500).json({ error: error.message });
       }
      
    }
});


// fetch the widget data from the schema based on the form_id
const FetchtheWidgets=async(form_id)=>{
    try{
        const childform = await ChildForm.find({foreignKey:form_id});
        console.log("widgetdata",childform);
        return childform;
    }
    catch(error){
        console.log("Error in Fetching Widgets",error);
        throw error
    }
};
// validate the data is unique or not
const validateTheUniqueValues = async (participantdata, childforms,form_id) => {
    for (const childform of childforms) {
        const { name, unique } = childform;
        if (unique) {
            const registerData = participantdata.find(field => Object.keys(field)[0] === name);
            if (registerData) {
                const value = registerData[name];
                try {
                    const existingParticipant = await Participant.findOne({ 'dynamicFields.form_id':form_id, 'dynamicFields.userData': { $elemMatch: { [name]: value } } });
                    if (existingParticipant) {
                        throw new Error(`Duplicate value '${value}' found for field '${name}'.`);
                    }
                } catch (error) {
                    throw error;
                }
            }
        }
    }
};


// validate the formdata
const validateTheFormData=(participantdata,childforms)=>{
    childforms.forEach((childform)=>{
        const {name,type} = childform;
        let value ;
        const participantField = participantdata.find(field => Object.keys(field)[0] === name);
        
        if (participantField) {
            value = participantField[name];
        }
        console.log("$$$$$value",value,name);

    switch(type){
        case 'email':
            if(!isValidateEmail(value)){
                throw new Error(`Invalid email for field:${name}`);
            }
            break;
        case 'mobile':
            if(!isValidMObile(value)){
                throw new Error(`Invalid mobile number for field:${name}`);
            }
            break;
        case 'number':
            if(!isValidNumber(value)){
                throw new Error('Invalid Numeric value');
            }
            break;
        case 'text':
            if(!isValidText(value)){
                throw new Error(`Invalid Text for field ${name}`);
            }
    }
    })
}

const isValidateEmail=(email)=>{
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

const isValidMObile=(mobile)=>{
    const mobileRegex = /^\d{10}$/;
    return mobileRegex.test(mobile);
}

const isValidNumber=(text)=>{
    const numericRegex = /^[0-9]+$/;
    return numericRegex.test(text);
}

const isValidText = (text) => {
    // Condition 1: Purely numeric
    const numericRegex = /^\d+$/;
  
    // Condition 2: Mixed with numeric
    const mixedNumericRegex = /^\d/;
  
    // Check for Condition 1
    if (numericRegex.test(text)) {
      return false;
    }
  
    // Check for Condition 2
    if (mixedNumericRegex.test(text)) {
      return false;
    }
  
    // Condition 3: "acss123" is valid
    return true;
  };



module.exports = router;
