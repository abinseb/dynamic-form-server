const mongoose =  require('mongoose');

const supperAdminSchema =  new mongoose.Schema({
    name:{
        type:String,
        require,
    },
    email:{
        type:String,
        require,
    },
    password:{
        type:String,
        require
    }
},{timestamps:true});

const Admin = mongoose.model("SupperAdmin",supperAdminSchema);

module.exports={
    Admin
};
