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
    likes:{
      type:Number,
      default:0
    },
    comments:{
      type: Array,
      default:[{
          createdBy:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
          },
          createdAt: {
            type: Date,
            default: Date.now
           },
           likes:{
            type:Number,
            default:0
          },
        }]
    },
    tags:{
        type:Array,
        required:true
    }
   
  },{timestamps: true});



  module.exports = mongoose.model('Posts', Posts);