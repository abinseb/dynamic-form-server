
const {User} = require('../model/User');

const bycrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


// validation midleware
// const validateUserData =[
//     // Validate name, email and password

//     check('name').notEmpty().withMessage('Name is required'),
//     check('email').isEmail().withMessage('Invalid Email'),
//     check('mobile').isMobilePhone().withMessage('Invalid Mobile Number'),
//     check('password').isLength({min:5}).withMessage('Password must be at least 5 characters long'),

//     //  Custom sanitizer to trim whitespace from  email
//     body('email').trim().normalizeEmail(),

   
//         (req,res,next)=>{
//             const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).json({ errors: errors.array() });
//         }
//         next();
//         }
// ];


const userSignUp =  async(req,res)=>{
    try{
        const {name,email,mobile,password} = req.body; //register user data

        // Check if  user with the same email already exists
        let user = await User.findOne({email,mobile});
        if(user){
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bycrypt.hash(password,10);

        const newUser = new User({
            name,
            email,
            mobile,
            password:hashedPassword
        });

        const savedUser = await newUser.save();

        // sending a success response
        res.status(201).json({message:'Registration Success',user:savedUser});
    }
    catch(error){
        console.error(error);
        res.status(500).json({error:'Internal Server Error'});
    }
};

// user Login
const userLogin = async(req,res)=>{
    try{
        const {email,password} = req.body;

        // find user by id
        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({message:'Invalid email or Password'})
        }

        //check password
        const isPassword = await bycrypt.compare(password , user.password)
        if(!isPassword){
            return res.status(401).json({message:'Invalid email or Password'});
        }

        // Generate jwt token
        const token = jwt.sign({userId:user._id},'ict-dynamic-form',{expiresIn:'5h'});
                res.status(200).json({token:token,message:'Login Success',name:user.name});
            
    }
    catch(error){
        console.error(error);
        res.status(500).json({error:'Internal Server Error'});
    }
};



module.exports = {
    userSignUp,
    userLogin
};
