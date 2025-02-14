const mongoose = require('mongoose');
const { User } = require('./User');

// project schema
const projectSchema = new mongoose.Schema({
    projectName:{
        type:String,
        require
    },
    projectDescription:{
        type:String,
        require
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:User
    },
},{timestamps:true});
const Project = mongoose.model("Project",projectSchema);
module.exports = {
    Project
};