const express = require('express');
const router = express.Router();
const { ParentForm, ChildForm } = require('../model/FormCreation');
const authenticateToken = require('../midleware/authMidleware')

// POST route to store multiple sets of form data
router.post('/createForms', authenticateToken, async (req, res) => {
    try {
        // Extract data from the request body
        const { formTitle,formUrl, formData } = req.body;
       
        // extract the userid from token during auth midleware
        const userId = req.userId;

        console.log("userid,",formTitle,userId);

        const existingParentForm = await ParentForm.findOne({formTitle});


        if (existingParentForm) {
            // If a ParentForm with the same formTitle exists, send a validation error response
            return res.status(400).json({ message: 'A form with the same title already exists' });
        }


        // Create a new ParentForm document
        const parentForm = await ParentForm.create({
             formTitle:formTitle,
             formUrl:formUrl,
             userId:req.userId,
             stopResponse:false, 
            });

        // Create an array to store ChildForm documents
        const childForms = [];

        // Iterate over each object in the formData array
        for (const data of formData) {
            // Create a new ChildForm document for each set of data
            const childForm = await ChildForm.create({
                label: data.label,
                name: data.name,
                widgetType: data.widgetType,
                type: data.type,
                listItems: data.listItems,
                fileType: data.fileType,
                required: data.required,
                unique:data.unique,
                foreignKey: parentForm._id // Set the foreign key to reference the ParentForm document
            });

            // Push the created ChildForm document to the array
            childForms.push(childForm);
        }

        // Send a success response with both the ParentForm and an array of ChildForms
        res.status(201).json({ parentForm, childForms , status:'true',form_id:parentForm._id});
    } catch (error) {
        // Handle any errors
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// get api for the created form
router.get('/forms/:parentId', async (req, res) => {
    try {
        // Get the parentId from the request parameters
        const { parentId } = req.params;

        // Find the ParentForm document
        const parentForm = await ParentForm.findById(parentId);

        // If ParentForm is not found, send a 404 response
        if (!parentForm) {
            return res.status(404).json({ error: 'ParentForm not found' });
        }

        // Find all ChildForm documents related to the parent using the parentId
        const childForms = await ChildForm.find({ foreignKey: parentId });
        const formResponse = {
                    form:parentForm,
                    data:childForms
        }
        // Send a success response with both ParentForm and ChildForms
        res.status(200).json({formResponse});
    } catch (error) {
        // Handle any errors
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/updateform/:id',authenticateToken, async(req,res)=>{
    try{
        // extract the data from the response body
        const {formTitle , formData} = req.body;
        const formId = req.params.id;

        console.log("formdata",formData);
        // Check if the form with the given id exists
        const existingParentForm = await ParentForm.findById(formId);
        if(!existingParentForm){
            return res.status(404).json({message:'Form not found'});
        }

        // Update the form title if provided
        if(formTitle){
            existingParentForm.formTitle = formTitle;
            await existingParentForm.save();
        }

        // Update child forms
        const childForms =[];
        for (const data of formData){
            let childForm;
            if(data._id){
                console.log("idddd________",data._id);
                // update the existing child forms
                childForm = await ChildForm.findByIdAndUpdate(data._id, data,{new: true});
            }
            else{
                childForm = new ChildForm({
                    label:data.label,
                    name:data.name,
                    widgetType:data.widgetType,
                    type:data.type,
                    listItems:data.listItems,
                    fileType:data.fileType,
                    required:data.required,
                    unique:data.unique,
                    foreignKey:formId
                });
                await childForm.save();
            }
            childForms.push(childForm);
        }

        res.status(200).json({parentForm:existingParentForm,childForms,status:true,form_id:existingParentForm._id});

    }
    catch(error){
        console.error(error);
        res.status(500).json({error:'Internal Server Error'});
    }

});

// ______________________get api for the form details(Parentform) based on the userId____________

router.get('/userformdata',authenticateToken,async(req,res)=>{
    try{
        const userId = req.userId;
        console.log("userid__",userId);
        const parentForm = await ParentForm.find({userId:userId});

        // if parent form is not found, send 404 response
        if(!parentForm){
            return res.status(404).json({error:'Not found'});
        }

        res.status(200).json({parentForm});

    }
    catch(error){
        console.error(error);
        res.status(500).json({error:'Inernal Server Error'});
    }
});

// ____________router for delete the child form

router.delete('/deletechildform/:childformId',authenticateToken,async(req,res)=>{
    try{
        const childformId = req.params.childformId;

        // check if the child form is exist or not
        const existingChildform = await ChildForm.findByIdAndDelete(childformId);
        if(!existingChildform){
            return res.status(404).json({message:'Widget not found'});
        }

        // delete the widget
        // await existingChildform.remove();

        res.status(200).json({message:'Widget deleted Successfully',status:true});

    }
    catch(error){
        console.error(error);
        res.status(500).json({error:'Internal Server Error'});
    }
});

// get api for geting Parent form data

router.get('/parentFormdata/:id',authenticateToken,async(req,res)=>{
    try{
        const formId = req.params.id;

        const parentForm = await ParentForm.findById(formId);
        if(!parentForm){
            res.status(404).json({message:'Not Found'});
        }

        res.status(200).json(parentForm);

    }
    catch(error){
        console.error(error);
        res.status(500).json({error:error});
    }
});

// api for updating the state stopResponse in the Parent forms
router.put('/responseState/:id', authenticateToken, async (req, res) => {
    try {
        const formid = req.params.id;
        const { stopResponse } = req.body;
        console.log("StopResponse:", stopResponse);
        console.log("Form ID:", formid);

        const stateUpdate = await ParentForm.findById(formid);
        console.log("State Update:", stateUpdate);

        if (!stateUpdate) {
            return res.status(404).json({ message: 'Not Found' });
        }

        stateUpdate.stopResponse = stopResponse;
        await stateUpdate.save();

        res.status(200).json({ message: 'Updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


router.delete('/formdelete/:id',authenticateToken,async(req,res)=>{
    try{
       const formid = req.params.id;

       const parentForm = await ParentForm.findById(formid);

       if(!parentForm){
        return res.status(404).json({message:'Form not found'});
       }

       await ChildForm.deleteMany({foreignKey:parentForm._id});

       await ParentForm.findByIdAndDelete(formid);

       res.status(200).json({message:'Form deleted Successfully',status:true});
    }
catch(error){
        console.error(error);
        res.status(500).json({error:'Internal Server Error'});
    }
});




module.exports = router;