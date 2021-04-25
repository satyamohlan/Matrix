const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  googleId: String,
  name:String,
  username: String,
  email: String,
  password: String,
  photo: {type:String,default:'assets/user.svg'}
});

const User = mongoose.model('User', UserSchema);

module.exports = User;