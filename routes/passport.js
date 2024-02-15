const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const mongoose = require("mongoose");

const app = express();



app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));



app.use(passport.initialize());
app.use(passport.session());

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;


mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


const userSchema = new mongoose.Schema({
  googleId: String,
  githubId: String,
  facebookId: String,
  name: String,
  photos: [{ value: String }],
 
});

const User = mongoose.model("Googlesignup", userSchema);

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      
      callbackURL: "http://localhost:4000/auth/google/callback",

    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await User.findOne({ googleId: profile.id });

        if (existingUser) {
          return done(null, existingUser);
        }

        const newUser = new User({
          googleId: profile.id,
          name: profile.displayName,
          photos: profile.photos,
        });

        await newUser.save();
        done(null, newUser);
      } catch (error) {
        done(error);
      }
    }
  )
);



passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = { GoogleUser: User };
module.exports = { User };
