const mongoose = require('mongoose');
const jwt=require('jsonwebtoken');
const config=require('config');


const Posts = mongoose.Schema({
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required:true,
    },
    photo: {
      type: String,
      required: true,
    },
    totalLikes:{
      type:Number,
      default:0
    },
    totalComments:{
      type:Number,
      default:0
    },
    comments:{
     type:Array
    },
    tags:{
        type:Array,
        required:true
    },
    postBy:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'User'
    },
    createdAt:{
      type: Date,
      default: Date.now
    },

   
  },{timestamps: true});



  module.exports = mongoose.model('Posts', Posts);