const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
    minLength: 3,
    maxLength: 255,
  },
  googleID: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  thumbnail: {
    type: String,
  },
  email:{
    type: String,
  },
  password: {
    type: String,
    // minLength: 8,
    maxLength: 1024,
  }
})

// 會在 googleDB 建立一個 collections 名為 users
module.exports = mongoose.model('users', userSchema)