const mongoose = require('mongoose')


// parent schema
const parentFormSchema = new mongoose.Schema({
    formTitle:{
        type:String,
        require
    }
})

// child schema
const formSchema = new mongoose.Schema(
    {
        label:{
            type:String,
            require
        },
        name:{
            type:String,
            require
        },
        widgetType:{
            type:String,
            require
        },
        type:{
            type:String,
        },
        listItems:[
            {
                type:String,
            }
        ],
        fileType:[
            {
                type:String,
            }
        ],
        required:{
            type:Boolean,
            require
        },
        foreignKey:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'ParentForm'
        }
    }
);
// model foe the parent schema
const ParentForm = mongoose.model("ParentForm",parentFormSchema);
// model for the child schema
const ChildForm = mongoose.model('ChildForm',formSchema);
module.exports = {
    ParentForm,
    ChildForm
};

