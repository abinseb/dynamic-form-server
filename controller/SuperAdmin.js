const {ParentForm , ChildForm} = require('../model/FormCreation');
const {User} = require('../model/User');
const Participant = require('../model/Participant');
const {Admin} = require('../model/Admin');
const bycrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const fetchAllFormData = async(req,res)=>{
    try{
        
        const parentForm = await ParentForm.find().select('-__v').populate({
            path:'userId',
            select:'-password'
        }).sort({createdAt:-1});

    if(!parentForm){
            return res.status(404).json({error:'Not found'});
    }
    const parentFormsWithCounts = await Promise.all(parentForm.map(async (parentForm) => {
        const formid = parentForm._id; // Assuming _id is the form id
        const participantCount = await countOfParticipants(formid);
        return {
            parentForm,
            participantCount
        };
    }));

    res.status(200).json({ parentFormsWithCounts });

  

//  res.status(200).json({parentForm}); 

}

catch(error){
        console.error(error);
        res.status(500).json({error:'Inernal Server Error'});
    }
};

const countOfParticipants = async (formid) => {
    try {
        console.log(formid)
        const count = await Participant.countDocuments({formId:formid});
        console.log('count',count);
        return count;
    } catch (error) {
        console.error("Error counting participants:", error);
        throw error;
    }
};

// const countOfParticipants = async (formid) => {
//     try {
//         const countResult = await Participant.aggregate([
//             { $match: { 'dynamicFields.form_id': formid } },
//             { $group: { _id: null, count: { $sum: 1 } } }
//         ]);

//         if (countResult.length > 0) {
//             return countResult[0].count;
//         } else {
//             return 0; // No matching documents found
//         }
//     } catch (error) {
//         console.error("Error counting participants:", error);
//         throw error;
//     }
// };



// post api controler function for supper admin signup
const adminSignUp = async(req,res)=>{
    try{
        const {name,email,password} = req.body;

        let admin = await Admin.findOne({email});
        if(admin){
            return res.status(400).json({message:'Email id already exist'});
        }
    
        const hashedPassword = await bycrypt.hash(password,10);

        const newUser = new Admin({
            name,
            email,
            password:hashedPassword
        });
        const saveAdminData = await newUser.save();

        res.status(201).json({message:'Reg Success',user:saveAdminData});
    }

    catch(error){
        console.error(error);
        res.status(500).json({error:'Internal Server Error'});
    }
};

// post api controler function for supper admin login
const AdminLogin = async(req,res)=>{
    try{
        const {email,password} = req.body;

        const adminUser = await Admin.findOne({email});
        if(!adminUser){
            return res.status(401).json({message:'Invalid email or password'});
        }
        const isPassword = await bycrypt.compare(password , adminUser.password);

        if(!isPassword){
            return res.status(401).json({message:'Invalid email or password'});

        }

        const token = jwt.sign({userId:adminUser._id},process.env.TOKEN_KEY,{expiresIn:'6h'});

        res.status(200).json({token:token,message:'Login Success',name:adminUser.email});
    }

catch(error){
        console.error(error);
        res.status(500).json({error:'Internal Server Error'})
    }
}


// verify the token
const adminTokenVerify = (req,res)=>{
    try{
        const token = req.headers['authorization'];
        console.log("token-admin-verify",req.headers);
        if(!token){
            return res.status(401).json(false);
        }

    jwt.verify(token,process.env.TOKEN_KEY,async(err,decoded)=>{
        if(err){
            return res.status(401).json(false);
        }
        const adminUser = await Admin.findById(decoded.userId);
        if(!adminUser){
            return res.status(403).json(false);
        }
        res.status(200).json(true);
        
    })
    }
catch(error){
    console.error(error);
    res.status(500).json(false);
}
}



//  exporting created functions
module.exports = {
    fetchAllFormData,
    adminSignUp,
    AdminLogin,
    adminTokenVerify
}