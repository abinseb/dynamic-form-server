const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
    dynamicFields: mongoose.Schema.Types.Mixed,
    formId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'ParentForm'
    },
},{timestamps:true});

const Participant = mongoose.model('Registration', registrationSchema);

module.exports = Participant;
