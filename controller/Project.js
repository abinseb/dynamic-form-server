const {Project} = require('../model/Project');
const { body, validationResult } = require('express-validator');

const validateProject = [
    body('projectName').notEmpty().withMessage('Project Name is required'),
    body('projectDescription').notEmpty().withMessage('Project Description is required'),
];
const createProject = async(req, res)=>{
    try{
        const {projectName,projectDescription} = req.body;
        console.log(projectName,projectDescription);
        const errors = validationResult(req);
        console.log(errors);
        if(!errors.isEmpty()){
            return res.status(400).json({errors:errors.array()});
        }
        const userId = req.userId;
        let projectexist = await Project.findOne({projectName,userId});
        if(projectexist){
            return res.status(400).json({message:'Project Already Exist'});
        }
        const project =   new Project({
            projectName:projectName,
            projectDescription:projectDescription,
            userId:userId
        });
        await project.save();
        res.status(200).json({message:'Project Created Successfully'});

    }
    catch(error){
        console.error(error);
        res.status(500).json({error:'Internal Server Error'});
    }
}

module.exports = {
    createProject,
    validateProject
};