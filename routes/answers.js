const express = require("express");
const Router = express.Router();
const User=require('../models/user');
const Post=require('../models/post');
const Answer=require('../models/answer');
const asyncMiddleware=require('../middleware/async');


Router.post('/',asyncMiddleware(async(req,res)=>{
   let description=req.body.description;
   let createdBy=req.body.createdBy;
   let createdOn=req.body.createdOn;
   let obj={
       description:description,
       createdBy:createdBy,
       createdOn:createdOn
   };
   let newAnswer=new Answer(obj);
   let result=await newAnswer.save();
   let totalanswers=await Post.findById(createdOn);
   totalanswers=totalanswers.totalAnswers;
   let postUpdate={
    $push:{
      answers:[{answerId:result._id}]
     },
    $set:{
        totalAnswers:totalanswers+1
    }
    
   };
   let userUpdate={
    $push:{
      answers:[{answerId:result._id,createdAt:Date.now()}]
     }
   }

   await User.updateOne({_id:createdBy},userUpdate);
   await Post.updateOne({_id:createdOn},postUpdate);
   res.send(result);
}));

Router.put('/like/:id',asyncMiddleware(async(req,res)=>{
  let result=await Answer.findById(req.params.id);
  if(result)
  {
      let totallikes=result.totalLikes;
      let userInfo=req.body.userid
      let doc={
        $set:{
          totalLikes:totallikes+1
        },
        $push:{
          likesBy:[{likedBy:userInfo,createdAt:Date.now()}]
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


Router.put('/disLike/:id',asyncMiddleware(async(req,res)=>{
    let result=await Answer.findById(req.params.id);
    if(result)
    {
        let totalDislikes=result.totalDisLikes;
        let userInfo=req.body.userid
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