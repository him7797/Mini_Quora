const mongoose = require('mongoose');



const Category = mongoose.Schema({
   
    title:{
        type:String,
        required:true,
        unique:true
    },
    photo:{
        type:String
    },
    description:{
        type:String,
        required:true
    },
    followersCount:{
        type:Number,
        default:0
    }
    
  },{timestamps: true});



  module.exports = mongoose.model('Category', Category);