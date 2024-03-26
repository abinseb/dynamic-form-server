
const Participant = require('../model/Participant');

const {ChildForm, ParentForm} = require('../model/FormCreation');

// const authenticateToken = require('../midleware/authMidleware');
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, path.join(__dirname, '../upload')); // Use path.join to get the absolute path
//     },
//     filename: function (req, file, cb) {
//         const uniqueSuffix = Date.now()+'-'+Math.round(Math.random() *1e9);
//         cb(null, uniqueSuffix + file.originalname);
//     }
// });

// const upload = multer({ storage:storage });


// this post api controler function is used to store the register data of the created forms
const saveParticipants= async (req, res) => {
    try {
       
        const dynamicFields = JSON.parse(req.body.dynamicFields);
        const participantdata = dynamicFields.registration;
        const form_id = dynamicFields.form_id;
        const userDataWithoutRequired = participantdata.map(data => {
            const { required, ...userDataWithoutRequired } = data;
            return userDataWithoutRequired;
        });

        // const form_id = req.body.dynamicFields.form_id;
        const files = req.files;
     
         // fetch the whole widget data based on the formid for proper validation
         const childForms = await FetchtheWidgets(form_id);
        
        //  validate the data
        await validateTheFormData(participantdata,childForms);
        // to create the object of the model and store these data to mongodb server
       await  validateTheUniqueValues(participantdata,childForms,form_id);
    //    check the form is closed or not
    const parentForm = await fetchTheParentFormData(form_id);
    if(parentForm.stopResponse){
        return res.status(403).json({error:'Registration is Closed'});
    }

        const newParticipantData = new Participant({
            
            dynamicFields:{
                userData:userDataWithoutRequired,
                form_id:form_id,
                files: files.map(file=>({[file.fieldname]:file.filename }))
            },
            formId:form_id,

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
};

// (get api)fetch the Parent form data , based on the formId fetch the corresponding parent form details
const fetchTheParentFormData =async(formid)=>{
    try{
        const parentForm = await ParentForm.findById(formid);
        console.log('parent Form',parentForm);
        return await parentForm;
    }
    catch(error){
        console.log("Error",error);
        throw error;
    }
}
// (get api)fetch the widget data from the schema based on the form_id, here we get the all widgets details
// of the form
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


// validate the formdata email, mobile, text of the forms are validating , it is a validating function
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

//   ______________________________get api for fetch the registerd users data______________

// registration data of the dynamic form is get by using this controler function
const fetchRegistration =  async(req,res)=>{
    try{
        const formId = req.params.id;
        const registration = await Participant.find({'dynamicFields.form_id':formId});
        if(!registration){
            res.status(404).json({message:'Not found'});
        }
        res.status(200).json(registration);
    }
    catch(error){
        console.error(error);
        res.status(504).json({error:'Internal Server Error'});
    }
}

// fetch the file  , the uploaded files of the dynamicaly created form is fetched by using
// this controler function 
const path = require('path');
const fs = require('fs');
const uploadDir  = path.join(__dirname,'../upload');

const fetchFile =async(req,res)=>{
    const filename = req.params.filename;

    const filepath = path.join(uploadDir,filename);
    fs.access(filepath,fs.constants.F_OK,err=>{
        if(err){
            return res.status(404).json({error:'File not found'})
        }
        res.sendFile(filepath);
    })
}

module.exports = {
    saveParticipants,
    fetchRegistration,
    fetchFile
};


