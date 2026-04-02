const passport = require('passport');
const Auth = require('./Model/Auth');
const LocalStrategy = require('passport-local').Strategy;

passport.use(
    new LocalStrategy(
        { usernameField: 'email', passwordField: 'password' },
        async (email, password, done) => {
            try {
                const user = await Auth.findOne({
                    email: email.trim().toLowerCase()
                });

                if (!user) {
                    return done(null, false, { message: 'Incorrect email or password' });
                }

                // ✅ USE MODEL METHOD
                const isMatch = await user.comparePassword(password);

                if (!isMatch) {
                    return done(null, false, { message: 'Incorrect email or password' });
                }

                return done(null, user);

            } catch (err) {
                console.error("PASSPORT ERROR:", err);
                return done(err);
            }
        }
    )
);

// SESSION
passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await Auth.findById(id).select('-password');
        if (!user) return done(null, false);
        done(null, user);
    } catch (err) {
        done(err);
    }
});