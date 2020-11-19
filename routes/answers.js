const express = require("express");
const Router = express.Router();
const User=require('../models/user');
const Post=require('../models/post');
const Answer=require('../models/answer');



Router.post('/',async(req,res)=>{
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
    $push:
    {
      answers:result._id
    },
    $set:{
        totalAnswers:totalanswers+1
    }
    
   }
   await User.updateOne({_id:createdBy},{$push:{answers:result._id}});
   await Post.updateOne({_id:createdOn},postUpdate);
   res.send(result);
});

Router.put('/like/:id',async(req,res)=>{
  let result=await Answer.findById(req.params.id);
  if(result)
  {
      let totallikes=result.totalLikes;
      await Answer.updateOne({_id:req.params.id},{$set:{totalLikes:totallikes+1}});
      return res.status(200).json({
        status: "Success",
        message: "Updated"
    });
  }
  return res.status(401).json({
    status: "Failed",
    message: "Answer with given id not found!"
});
  
});


Router.put('/disLike/:id',async(req,res)=>{
    let result=await Answer.findById(req.params.id);
    if(result)
    {
        let totalDislikes=result.totalDisLikes;
        await Answer.updateOne({_id:req.params.id},{$set:{totalDisLikes:totalDislikes+1}});
        return res.status(200).json({
          status: "Success",
          message: "Updated"
      });
    }
    return res.status(401).json({
      status: "Failed",
      message: "Answer with given id not found!"
  });
    
  });
  












module.exports=Router;