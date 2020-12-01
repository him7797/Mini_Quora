const express = require("express");
const Router = express.Router();
const User=require('../models/user');
const Post=require('../models/post');
const asyncMiddleware=require('../middleware/async');
// const auth=require('../middleware/auth');
const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

Router.get('/',asyncMiddleware(async(req,res)=>{
    let pageNo = req.query.pageNo;
    let limit = 10;
    let skipPosts = (pageNo-1)*limit;
    let posts=await Post.find({status:true}).sort({updatedAt:-1}).skip(skipPosts).limit(limit)
        .populate('postBy')
        .populate('answers.answerId');
    let allPosts=[];


    for(let i in posts) {
        if (posts[i].answers.length > 0) {
            let name = await User.findById(posts[i].answers[0].answerId.createdBy);
            name = name.name;
            let obj;
            obj = {
                title: posts[i].title,
                totalanswers: posts[i].totalAnswers,
                tags: posts[i].tags,
                postBy: posts[i].postBy.name,
                profession: posts[i].postBy.about,
                photo: posts[i].photo,
                totalLikes: posts[i].answers[0].answerId.totalLikes,
                description: posts[i].answers[0].answerId.description,
                answerBy: name,
                year: posts[i].createdAt.getFullYear(),
                month: monthNames[posts[i].createdAt.getMonth()],
                date: posts[i].createdAt.getDate(),
                userPhoto: posts[i].postBy.photo,
            };
            allPosts.push(obj);
        } else {
            let obj;
            obj = {
                title: posts[i].title,
                totalanswers: posts[i].totalAnswers,
                tags: posts[i].tags,
                postBy: posts[i].postBy.name,
                profession: posts[i].postBy.about,
                photo: posts[i].photo,
                year: posts[i].createdAt.getFullYear(),
                month: monthNames[posts[i].createdAt.getMonth()],
                date: posts[i].createdAt.getDate(),
                userPhoto: posts[i].postBy.photo
            };
            allPosts.push(obj);
        }
    }

    res.render('home',{
        data:allPosts
    });


}));















module.exports=Router;