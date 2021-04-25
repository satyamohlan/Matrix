const mongoose = require('mongoose');

const record = new mongoose.Schema({
  message: {
    type: String,
    required:true
  },
  time: {
    type: Date,
    default: Date.now
  },
  disptime:{
    type:String
  },
  from: {
    type: String,
    required: true
  },
  to: {
    type: String,
    default:'all'
  }
});

const message = mongoose.model('message', record);

module.exports = message;