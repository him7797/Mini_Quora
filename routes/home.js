const express = require("express");
const Router = express.Router();
const User=require('../models/user');
const Post=require('../models/post');
const Answer=require('../models/answer');
const asyncMiddleware=require('../middleware/async');
const auth=require('../middleware/auth');

Router.get('/',asyncMiddleware(async(req,res)=>{
    let pageNo = req.query.pageNo;
    let limit = 10;
    let skipPosts = (pageNo-1)*limit;
let posts=await Post.find().sort({updatedAt:-1}).skip(skipPosts).limit(limit)
    .populate('postBy')
    .populate('answers.answerId');


}));















module.exports=Router;