const mongoose = require('mongoose');



const Posts = mongoose.Schema({
    title: {
      type: String,
      required: true
    },
    photo: {
      type: String,
      required: true,
    },
    
    answers:[{
      answerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Answers'
      },
      createdAt:{
        type:Date
      }
    }],
    totalAnswers:{
      type:Number,
      default:0
    },
    tags:{
        type:Array,
        required:true
    },
    postBy:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'User',
      required:true
    },
    status:{
      type:Boolean,
      default:true
    }
  },{timestamps: true});



  module.exports = mongoose.model('Posts', Posts);