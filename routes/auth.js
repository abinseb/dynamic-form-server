const router = require("express").Router();
const passport = require("passport");
const jwt = require('jsonwebtoken');
const { User }  = require('../model/User');


const CLIENT_URL = "https://forms.ictkerala.org";


router.get("/google", passport.authenticate("google",{scope:['profile','email']}));

router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect:`/auth/login/success`, 
    failureRedirect: "/login/failed",
  })
);

router.get("/login/success",async (req, res) => {
  if (req.user) {
    // res.header('Access-Control-Allow-Origin', CLIENT_URL);
    // res.header('Access-Control-Allow-Credentials', 'true');
    console.log("userrss_____",req.user);
    const user = await User.findOne({googleId:req.user.googleId });
    if(!user){
      return res.status(401).json({message:'Authentication Failed'});
    }
    const token = jwt.sign({userId:user._id},process.env.TOKEN_KEY,{expiresIn:'5h'});
    console.log("token",token);
     const domain = 'https://forms.ictkerala.org';
    const path = '/'
    res.cookie('token',token,{httpOnly:false , domain:domain ,path:path});
    res.cookie('username',user.name,{httpOnly:false , domain:domain ,path:path});
    res.redirect(`/project`);
   
  } 
  else {
    res.status(401).json({
      success: false,
      message: "unauthorized",
    });
  }
});

router.get("/login/failed", (req, res) => {
  res.status(401).json({
    success: false,
    message: "failure",
  });
});

router.get("/logout", (req, res) => {
  // req.session = null;
  req.logout();
  res.redirect(CLIENT_URL);
})






// router. Get(
//   "/googleLogin/callback",
//   passport.authenticate("google", {
//     session: false,
//     failureRedirect: frontEndUrl + "/user/login",
//   }),
//   expressAsyncHandler((req, res) => {
//     setAccessTokenCookie(req.user, res);
//     res.redirect(frontEndUrl);
//   })
// );






module.exports = router;