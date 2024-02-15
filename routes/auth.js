const router = require("express").Router();
const passport = require("passport");

const CLIENT_URL = "http://localhost:4000";

router.get("/login/success", (req, res) => {
  if (req.user) {
    res.header('Access-Control-Allow-Origin', CLIENT_URL);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.status(200).json({
      success: true,
      message: "successful",
      user: req.user,
    });
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

// router.get('/logout', (req, res) => {
//   req.logout();
//   req.session = null;
//   res.header('Access-Control-Allow-Origin', [CLIENT_URL, 'http://localhost:5000']);
//   res.redirect(CLIENT_URL);
// });

router.get("/logout", (req, res) => {
  req.session = null;
  req.logout();
  res.redirect('/');
})


// router.get('/logout11', (req, res) => {

//   req.session = null;
//   req.logout();

//   res.header('Access-Control-Allow-Origin', 'https://myplantstore.me');
//   res.redirect('https://myplantstore.me');

// // router.get("/logout", (req, res) => {
// //   req.logout();
// //   // Redirect after 3 seconds
// //   setTimeout(function() {
// //     res.redirect(CLIENT_URL);
// //   }, 1000);

// });

router.get("/google", passport.authenticate("google", { scope: ["profile"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: CLIENT_URL,
    failureRedirect: "/",
  })
);

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