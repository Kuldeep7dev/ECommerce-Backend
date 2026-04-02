const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const Auth = require('./Model/Auth');

// LOGIN USING EMAIL + PASSWORD
passport.use(
    new LocalStrategy(
        { usernameField: 'email', passwordField: 'password' },
        async (email, password, done) => {
            try {
                // find user by email
                const user = await Auth.findOne({ email: email });

                if (!user) {
                    return done(null, false, { message: 'Incorrect email or password' }); // Generic message for security
                }

                // compare password (using model method)
                const isMatch = await user.comparePassword(password);

                if (!isMatch) {
                    return done(null, false, { message: 'Incorrect email or password' });
                }

                // success
                return done(null, user);

            } catch (err) {
                return done(err);
            }
        }
    )
);

// STORE USER ID IN SESSION
passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await Auth.findById(id).select('-password'); // remove password from session
        if (!user) return done(null, false);

        done(null, user);
    } catch (err) {
        done(err);
    }
});
