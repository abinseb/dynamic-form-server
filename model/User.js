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
        require
    },
    password:{
        type:String,
        require
    }
});

const User = mongoose.model("User",userDataSchema);


module.exports = {
    User
};
