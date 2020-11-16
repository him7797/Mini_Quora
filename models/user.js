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
        type:String,
    },
    password: {
      type: String,
      required:true,
      
    },
    phone: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 10
    },
    email:{
      type:String,
      required:true,
      
    },
    photo:{
      type:String,
    },
    interests:{
      type: Array,
     
    },
    posts:{
        type: Array,
    },
    bookmark:{
        type:Array
    },
    following:{
      type:Array
    }
  },{timestamps: true});

  User.methods.generateAuthToken=function(){
    const token=jwt.sign({_id:this._id},config.get('jwtPrivateKey'));
    return token;
  }





  module.exports = mongoose.model('User', User);