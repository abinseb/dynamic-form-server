const express =  require('express');
const nodemailer = require('nodemailer');
const {User} =  require('../model/User');
const bycrypt = require('bcrypt');

const otpDB ={};

const OTP_EXPIRY_TIME = 60 * 60 * 1000; // ONE MIUTE EXPIRY TIMESTAMPS


const trasporter = nodemailer.createTransport({
    service:'Gmail',
    auth:{
        user:'abinp0902@gmail.com',
        pass:'rlkezxkkudidesfk'
    }
});

// post api for forgot password, here send the otp for the inputed email.This function is use 
// use the creating form users for resetting the password 
const forgotPassword =async(req,res)=>{
    try{
        const {email} = req.body;
        const user = await User.findOne({email});
        if(!user){
            res.status(400).json({message:'Please enter registered email Id'});
        }

        const otp = Math.floor(100000 + Math.random() * 900000);

        const otpExpiry = Date.now() + OTP_EXPIRY_TIME;

        otpDB[email] = {otp: otp.toString() ,expiry:otpExpiry};

        const mailOptions = {         //choose the mail options to sent mail
            from:'abinp0902@gmail.com',
            to:email,
            subject:'Ict froms reset Password',
            text:`Your OTP for password reset is : ${otp}`
        };
        trasporter.sendMail(mailOptions,(error,info)=>{
            if(error){
                console.log(error);
                res.status(500).json({message:'Error sending email'});
            }
            else{
                console.log('Email sent :'+info.response );
                // res.send('OTP sent');
                res.status(200).json({message:'Password reset OTP is sent to your email.'})
                console.log('otp temp',otpDB[email]);
            }
        });

    }
    catch(error){
        console.error(error);
    }
}

// verify the otp , send to the email
const verifyOTP =async(req,res)=>{
    try{
        const {email,otp} =  req.body;
        console.log("email and otp " , email ,otp);

        console.log("email otp in the temp", otpDB[email]);

        if(otpDB[email] && otpDB[email].otp === otp){
            if(Date.now() > otpDB[email].expiry){
                res.status(400).json({error:'OTP Expired'});
            }
            else{
                // res.send('OTP Verified');
                res.status(200).json({message:'OTP Verified',status:true})
            }
        }
        else{
            res.status(400).json({error:'Invalid OTP'})
        }
    }
    catch(error){
        console.error(error);
    }
}

// this post api controler function is used to reset or update the old password to new
const resetPassword =async(req,res)=>{
    try{
        const {email,newPassword} = req.body;
        const user = await User.findOne({email});
        if(!user){
            res.status(400).json("User not found");
        }
        console.log(user)
        const hashedPassword = await bycrypt.hash(newPassword,10);
        user.password = hashedPassword;
        await user.save();
        res.status(200).json({message:'Password Updated Successfully'});
    }
    catch(error){
        res.status(500).json({error:error,message:'Internal Server Error'});
    }
}

module.exports = {
    resetPassword,
    forgotPassword,
    verifyOTP
}
