const mongoose = require('mongoose');



const Posts = mongoose.Schema({
    title: {
      type: String,
      required: true
    },
    photo: {
      type: String,

    },
    
    answers:[{
      answerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Answers'
      },
      createdAt:{
        type:Date
      },
        createdBy:{
          type:mongoose.Schema.Types.ObjectId,
            ref: 'User'
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
    },
    likesBy:[{
        likedBy:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        createdAt:{
            type:Date
        },
        likeStatus:{
            type:Boolean
        }
    }],
    totalLikes:{
        type:Number,
        default:0
    }
  },{timestamps: true});



module.exports = mongoose.model('Posts', Posts);