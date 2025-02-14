const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const path = require('path');
// const passport = require('passport')
// const { session } = require('passport');
const session = require('express-session');
const passport = require('passport');


const formRoute = require('./routes/FormRoutes'); //route for form data
const registrationRoute = require('./routes/RegistrationRoutes'); //route for participants
const userSignUp = require('./routes/UserRoutes');
const userLogin = require('./routes/auth')
const passportset=require('./routes/passport');

const forgotpassword = require('./routes/forgot_pass_route'); //change the password 
const superadminRoutes = require('./routes/SuperAdmin');
// project routes
const projectRoute = require('./routes/Project')

// call express and cors
const app = express();
app.use(express.json());
app.use(cors());

// for hosting call the build file
// hosting
// app.use(express.static(path.join(__dirname, 'build'))) 

const PORT = process.env.PORT || 4002 ;

// Connect to mongodb
mongoose.connect(process.env.MONGODB_URI,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(()=>console.log("Database Connected"))
.catch(err => console.log(err));

app.use(session({
    secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// fetch the uploaded files
app.use('/images',express.static(path.join(__dirname, './uploadformTitleImage')))

// call the route 
app.use("/",formRoute); // routes for forms 
// app.use('/authgoogle',authRoutes);// google routes for login and sign up 
app.use('/participant',registrationRoute); // routes for created form registration
app.use('/user',userSignUp); // sign up routes
app.use('/auth',userLogin); //login routes
app.use('/password',forgotpassword);
app.use('/superAdmin',superadminRoutes);
app.use('/project',projectRoute);

// hosting for routing
// app.get("*", function (req, res) {
//   res.sendFile(path.join(__dirname, "./build/index.html"));
// })

app.listen(PORT, ()=>console.log('Server Connected',PORT));

