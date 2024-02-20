const mongoose = require('mongoose');

// user schema
const userDataSchema = new mongoose.Schema({
    name:{
        type:String,
        require
    },
    email:{
        type:String,
        require
    },
    mobile:{
        type:String,
        
    },
    password:{
        type:String,
        require
    },
    googleId:{
        type:String,
        unique:true,
    }
});

const User = mongoose.model("User",userDataSchema);


module.exports = {
    User
};
