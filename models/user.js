const mongoose = require('mongoose');


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
      minlength: 10,
      maxlength: 10
    },
    email:{
      type:String,
      required:true,
      
    },
    dob:{
     type:String,
     required:true
    },
    photo:{
      type:String,
    },
    interests:{
      type: Array,
     
    },
    posts:[{
      postId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Posts'
      },
    }],
    answers:[{
      answerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Answers'
      },
        createdAt: {
          type:Date
        }
    }],
    bookmark:{
        type:Array
    },
    following:{
        type:Array
    }
  },{timestamps: true});







module.exports = mongoose.model('User', User);