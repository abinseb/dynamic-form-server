const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
// const passport = require('passport')
const formRoute = require('./routes/FormRoutes'); //route for form data
const registrationRoute = require('./routes/RegistrationRoutes'); //route for participants
const userSignUp = require('./routes/UserRoutes');
const app = express();
app.use(express.json());
const userLogin = require('./routes/auth')
const passportset=require('./routes/passport')
// use cors
app.use(cors());

const PORT = process.env.PORT || 4000 ;

// Connect to mongodb
mongoose.connect(process.env.MONGODB_URI)
.then(()=>console.log("Database Connected"))
.catch(err => console.log(err));

// app.get("*", function (req, res) {
//     res.sendFile(path.join(__dirname, "./build/index.html"));
// })
// call the route 
app.use("/",formRoute);
app.use('/participant',registrationRoute);
app.use('/user',userSignUp);
app.use('/auth',userLogin)

app.listen(PORT, ()=>console.log('Server Connected',PORT));

