const mongoose = require('mongoose');
const jwt=require('jsonwebtoken');
const config=require('config');


const User = mongoose.Schema({
    name: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 100
    },
    about:{
        type:String
    },
    password: {
      type: String,
      required:true,
      maxlength:10
    },
    phone: {
      type: String,
      required: true,
      unique:true,
      minlength: 10,
      maxlength: 10
    },
    email:{
      type:String,
      required:true,
      unique:true
    },
    interest:{
      type: Array,
      required:true
    },
    posts:{
        type: Array,
    },
    bookmark:{
        type:Array
    }
  },{timestamps: true});

  User.methods.generateAuthToken=function(){
    const token=jwt.sign({_id:this._id},config.get('jwtPrivateKey'));
    return token;
  }

  module.exports = mongoose.model('User', User);