const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();

const formRoute = require('./routes/FormCreateRoute'); //route for form data


const app = express();
app.use(express.json());

// use cors
app.use(cors());

const PORT = process.env.PORT || 4000 ;

// Connect to mongodb
mongoose.connect(process.env.MONGODB_URI)
.then(()=>console.log("Database Connected"))
.catch(err => console.log(err));

// call the route 
app.use("/",formRoute);

app.listen(PORT, ()=>console.log('Server Connected',PORT));

