const express = require("express");
const Router = express.Router();
const User=require('../models/user');
const Post=require('../models/post');
const Answer=require('../models/answer');


Router.get('/',async(req,res)=>{
let posts=await Post.find()
.sort({updatedAt:-1})
.populate('postBy')
.populate('answers.answerId')

res.send(posts);
})















module.exports=Router;