const passport  = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const {User} = require('../model/User');



const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback" // Corrected callback URL
},
async (accessToken, refreshToken, profile, done) => {
    try {
        console.log("profile",profile);
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
            user = new User({
                name: profile.displayName,
                // email: profile.emails.value,
                googleId: profile.id
            });
            await user.save();
        }
        // pass the user to the next middleware
        done(null, user);
    } catch (error) {
        done(error, null);
    }
}));

// Serialize user
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// module.exports = { GoogleUser: User };
// module.exports = { User };


