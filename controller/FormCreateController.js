

const { ParentForm, ChildForm } = require('../model/FormCreation');

const upload = require('../midleware/uploadTitleFile')
// POST route to store multiple sets of form data
// create the forms , with widgets these form and widgets are store in the different table
const createForms =async (req, res) => {
    try {
        // Extract data from the request body
        const { formTitle,formUrl, formData,projectId } = req.body;
      
        const formImage = req.file;
        console.log("fileimageReq.body",formImage);
       const formTitleImage = formImage ? formImage.filename : '';
        // extract the userid from token during auth midleware
        console.log("project id",projectId);
        const existingParentForm = await ParentForm.findOne({formTitle,projectId});


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
             status:'0',
             formTitleImage:formTitleImage,
             projectId:projectId
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
                fileSize:data.fileSize,
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
        res.status(500).json({ error: 'Internal controler Server Error' });
    }
};

// get api for fetch the created form details with its corresponding widgets, 
const getFormDataWithWidgets= async (req, res) => {
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
                    form:{
                        ...parentForm.toJSON(),
                        formTitleImageLink:parentForm.formTitleImage ? `http://192.168.1.117:4002/images/${parentForm.formTitleImage}` : null
                    },
                    data:childForms
        }
        // Send a success response with both ParentForm and ChildForms
        res.status(200).json({formResponse});                                                      
    } catch (error) {
        // Handle any errors
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// upadate the form data and its corresponding widgets
const updateFormData = async(req,res)=>{
    try{
        // extract the data from the response body
        const {formTitle , formData} = req.body;
        const formId = req.params.id;
        const formImage = req.file;
        console.log("formimage",formImage);
        const formTitleImage = formImage ? formImage.filename : '';
        const userId = req.userId;
        console.log("formdata",formData);
        // Check if the form with the given id exists
        const existingParentForm = await ParentForm.findById(formId);
        if(!existingParentForm){
            return res.status(404).json({message:'Form not found'});
        }

        const existingParentforms =  await ParentForm.findOne({
            formTitle,
            userId,
            _id:{$ne:formId}
        })
        if(existingParentforms){
            return res.status(404).json({message:'Form title is already exist in another form'});
        }
        // Update the form title if provided
        if(formTitle){
            existingParentForm.formTitle = formTitle;
            if(formImage){
                existingParentForm.formTitleImage = formTitleImage;
            }
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
                    fileSize:data.fileSize,
                    foreignKey:formId
                });
                await childForm.save();
            }
            childForms.push(childForm);
        }

        res.status(200).json({parentForm:existingParentForm,childForms,status:true,form_id:existingParentForm._id,message:'Updated'});

    }
    catch(error){
        console.error(error);
        res.status(500).json({error:'Internal Server Error'});
    }

};

// ____get api for the form details(Parentform) based on the userId____________

const getFormDataBasedOnUserId = async(req,res)=>{
    try{
        const userId = req.userId;
        const {projectId} = req.body;
        const parentForm = await ParentForm.find({userId:userId,projectId:projectId , status:{$ne:'2'}});

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
};

// ____________router for delete the child form

const deleteWidgets = async(req,res)=>{
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
};

// get api for geting Parent form data

const getFormdataBasedOnId = async(req,res)=>{
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
};



// api for updating the state stopResponse in the Parent forms
const responseStateUpdate =  async (req, res) => {
    try {
        const formid = req.params.id;
        const { stopResponse } = req.body;
        console.log("StopResponse:", stopResponse);
        console.log("Form ID:", formid);
        let statusSate = null;
        if(stopResponse === true){
            statusSate = '1'
        }
        else{
            statusSate = '0'
        }

        const stateUpdate = await ParentForm.findById(formid);
        console.log("State Update:", stateUpdate);

        if (!stateUpdate) {
            return res.status(404).json({ message: 'Not Found' });
        }
        console.log("Status state",statusSate);
        stateUpdate.stopResponse = stopResponse;
        stateUpdate.status = statusSate;
        await stateUpdate.save();

        res.status(200).json({ message: 'Updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


// delete the  form data with all widgets
const deleteFormData_withWidgets = async(req,res)=>{
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
};

// remove the form by change the status to 2
const removeTheFormData =async(req,res)=>{
    try{
        const formId = req.params.id;
        const formdata = await ParentForm.findById(formId);
        if(!formdata){
            return res.status(404).json({message:'Form not found'});
        }
        formdata.status = '2';
        await formdata.save();
        res.status(200).json({message:'Form Removed Successfully'});
    }
    catch(error){
        console.error(error);
        res.status(500).json({error:'Internal Server Error'});
    }
}


module.exports = {
    createForms,
    getFormDataWithWidgets,
    updateFormData,
    getFormDataBasedOnUserId,
    deleteWidgets,
    getFormdataBasedOnId,
    responseStateUpdate,
    deleteFormData_withWidgets,
    removeTheFormData
};
