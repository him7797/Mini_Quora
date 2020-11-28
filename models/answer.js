const mongoose = require('mongoose');



const Answers = mongoose.Schema({
   
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
    totalLikes:{
        type:Number,
        default:0
      },
    totalDisLikes:{
        type:Number,
        default:0
    },
    likesBy:[{
        likedBy:{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        createdAt:{
          type:Date
        }
      }],
    disLikeBy:[{
        disLikedBy:{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        createdAt:{
          type:Date
        }
      }]
    
  },{timestamps: true});



  module.exports = mongoose.model('Answers', Answers);