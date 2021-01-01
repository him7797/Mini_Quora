const express = require("express");
const Router = express.Router();
const User=require('../models/user');
const Post=require('../models/post');
const Answer=require('../models/answer');
const asyncMiddleware=require('../middleware/async');
const auth=require('../middleware/auth');


Router.post('/:id',auth,asyncMiddleware(async(req,res)=>{
   let description=req.body.description;
   let createdBy=req.userData.id;
   let createdOn=req.params.id;
   let obj={
       description:description,
       createdBy:createdBy,
       createdOn:createdOn
   };
   let newAnswer=new Answer(obj);
   let result=await newAnswer.save();
   let postUpdate={
    $push:{
      answers:[{answerId:result._id,createdBy:createdBy,createdAt:Date.now()}]
     },
    $inc:{
        totalAnswers:1
    }
   };
   let userUpdate={
    $push:{
      answers:[{answerId:result._id,createdAt:Date.now()}]
     }
   }
   await User.updateOne({_id:createdBy},userUpdate);
   await Post.updateOne({_id:createdOn},postUpdate);
   res.redirect('/api/users/');
}));

Router.get('/like/:id',auth,asyncMiddleware(async(req,res)=>{
    let userId=req.userData.id;
    let ansId=req.params.id;
    console.log(req.params.id);
    let checkLike=await Answer.find({$and:[{_id:ansId},{"likesBy.likedBy":userId},{"likesBy.likeStatus":true}]});
    console.log(checkLike);
    if(checkLike.length>0) return res.status(409).json({
        status: "Failed",
        message: 'Answer Already Liked'
    });
    else
    {
        let obj;
        obj={
            $inc:{
                totalLikes:1
            },
            $addToSet:{
                likesBy:{
                    likedBy:userId,
                    createdAt:Date.now(),
                    likeStatus:true
                },
            }

        };
        await Answer.updateOne({_id:ansId},obj);
        res.redirect('/api/users/');
    }
  
}));


Router.put('/disLike/:id',asyncMiddleware(async(req,res)=>{
    let result=await Answer.findById(req.params.id);
    if(result)
    {
        let totalDislikes=result.totalDisLikes;
        let userInfo=req.body.userId
        let doc={
          $set:{
            totalDisLikes:totalDislikes+1
          },
          $push:{
            disLikeBy:[{disLikedBy:userInfo,createdAt:Date.now()}]
           }
        }
        await Answer.updateOne({_id:req.params.id},doc);
        return res.status(200).json({
          status: "Success",
          message: "Updated"
      });
    }
    return res.status(401).json({
      status: "Failed",
      message: "Answer with given id not found!"
  });
    
  }));
  












module.exports=Router;