const express=require('express');
const Router=express.Router();
const asyncMiddleware=require('../middleware/async');
const auth=require('../middleware/auth');
const Post=require('../models/post');
const Answer=require('../models/answer');
const User=require('../models/user');


Router.get('/',asyncMiddleware(async(req,res)=>{
let user=req.body.id;
let userInfo=await User.findById(user).populate('posts.postId').populate('answers.answerId');
let posts=userInfo.posts;
let answers=userInfo.answers;
console.log(posts);
console.log(answers);


let answersLikesIds=[];
let postAnswersIds=[];

    return res.status(200).json({
        postsAnswers:posts ,
        answersLikes:answers
    });
}));








module.exports=Router;