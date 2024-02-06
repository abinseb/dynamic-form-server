const express = require('express');
const router = express.Router();
const { ParentForm, ChildForm } = require('../model/FormCreation');


// POST route to store multiple sets of form data
router.post('/createForms', async (req, res) => {
    try {
        // Extract data from the request body
        const { formTitle, formData } = req.body;

        const existingParentForm = await ParentForm.findOne({formTitle});

        if (existingParentForm) {
            // If a ParentForm with the same formTitle exists, send a validation error response
            return res.status(400).json({ message: 'A form with the same title already exists' });
        }


        // Create a new ParentForm document
        const parentForm = await ParentForm.create({ formTitle });

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



module.exports = router;