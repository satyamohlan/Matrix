const passport = require('passport');
const GooogleStrategy = require('passport-google-oauth20');
const LocalStrategy = require('passport-local').Strategy;

const user = require('../models/user.js');
const mongoose = require('mongoose');
const db = require('./keys').MongoUri;
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('mongo db connected'))
  .catch((err) => console.log(err));

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser((id, done) => {

  user.findById(id).then((data) => {
    done(null, data);
  });
});
passport.use(
  new GooogleStrategy({
      callbackURL: '/google/redirect',
      clientID: '745513639572-i8t8scp3pc63fjdv8umth42o6b3k2hpi.apps.googleusercontent.com',
      clientSecret: 'kjuSe_dcvcotW3TVP_3jh4wA',
    },
    (accessToken, refreshToken, profile, done) => {
      console.log(profile);
      user
        .findOne({
          googleId: profile.id,
        })
        .then((data) => {
          if (data) {
            console.log('user is:', data);
            done(null, data);
          } else {
            let pro = new user({
              googleId: profile.id,
              name: profile.displayName,
              photo: profile.photos[0].value

            });
            pro.save().then(() => {
              console.log('new user created' + pro);
              done(null, pro);
            });
          }
        });
    }
  )
);
passport.use(
  new LocalStrategy({
      usernameField: 'id',
      passwordField: 'password',
    },
    function (username, password, done) {
      user.findOne({
          email: username,
        },
        function (err, User) {
          if (err) {
            return done(err);
          }
          if (!User || User.password != password) {
            console.log('Incorrect Username/Password');
            return done(null, false, {
              message: 'Incorrect Username/Password',
            });
          } else {
            console.log(User);
            return done(null, User);
          }
        }
      );
    }
  )
);
