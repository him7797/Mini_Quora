const mongoose = require('mongoose');
// const jwt=require('jsonwebtoken');
// const config=require('config');


const Comments = mongoose.Schema({
   
    description:{
        type:String,
        required:true
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    createdOn:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Posts'
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    totalLikes:{
        type:Number,
        default:0
    }
    
  },{timestamps: true});



  module.exports = mongoose.model('Comments', Comments);