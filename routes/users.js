const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/hellow_harsh");

const userSchema = mongoose.Schema({
  username : String,
  age : Number,
  password : String,
  image : String,
  posts : [{
      type : mongoose.Schema.Types.ObjectId , ref : "post"    
  }]
});
userSchema.plugin(plm);

module.exports = mongoose.model('user' , userSchema);
