const express = require("express");
const Router = express.Router();
const User=require('../models/user');
const Post=require('../models/post');
const Category=require('../models/category');
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "June",
    "July", "Aug", "Sep", "Oct", "Nov", "Dec"
];
const auth=require('../middleware/auth');
const asyncMiddleware=require('../middleware/async');


//Rendering the Signup page
Router.get('/', asyncMiddleware(function(req, res){
    res.render('SignUp');
}));

//Rendering the Login Page
Router.get('/logIn', asyncMiddleware(function(req, res){
    res.render('logIn');
}));


Router.get('/home',auth,asyncMiddleware(async(req,res)=>{
    let user=await User.findById(req.userData.id);
    let posts=await Post.find({status:true}).sort({updatedAt:-1}).populate('postBy').populate('answers.answerId');
    let allPosts=[];
    let totalTags=[];
    for(let i in posts) {
        if (posts[i].answers.length > 0) {
            let answerUser = await User.findById(posts[i].answers[0].answerId.createdBy);
            let answerName = answerUser.name;
            let answerProfession=answerUser.about;
            let answerPhoto=answerUser.photo;
            let obj;
            obj = {
                title: posts[i].title,
                totalAnswers: posts[i].totalAnswers,
                tags: posts[i].tags,
                id:posts[i]._id,
                answerId:answerUser._id,
                answerIds:posts[i].answers[0].answerId._id,
                userId:posts[i].postBy._id,
                postBy: posts[i].postBy.name,
                postByPhoto:posts[i].postBy.photo,
                profession: posts[i].postBy.about,
                answerName: answerName,
                postLike:posts[i].totalLikes,
                answerProfession:answerProfession,
                answerPhoto:answerPhoto,
                totalLikes: posts[i].answers[0].answerId.totalLikes,
                description: posts[i].answers[0].answerId.description,
                postYear: posts[i].createdAt.getFullYear(),
                postMonth: monthNames[posts[i].createdAt.getMonth()],
                postDate: posts[i].createdAt.getDate(),
                answerYear:posts[i].answers[0].answerId.createdAt.getFullYear(),
                answerMonth:monthNames[posts[i].answers[0].answerId.createdAt.getMonth()],
                answerDate:posts[i].answers[0].answerId.createdAt.getDate()

            };
            allPosts.push(obj);
            totalTags.push(posts[i].tags);
        } else {
            let obj;
            obj = {
                title: posts[i].title,
                totalAnswers: posts[i].totalAnswers,
                tags: posts[i].tags,
                id:posts[i]._id,
                userId:posts[i].postBy._id,
                postBy: posts[i].postBy.name,
                postLike:posts[i].totalLikes,
                profession: posts[i].postBy.about,
                postYear: posts[i].createdAt.getFullYear(),
                postMonth: monthNames[posts[i].createdAt.getMonth()],
                postDate: posts[i].createdAt.getDate(),
                postByPhoto: posts[i].postBy.photo,
                description:"Be the first one to answer!",
                totalLikes:0
            };
            allPosts.push(obj);
            totalTags.push(posts[i].tags);
        }
    }
     user={
        currentUser:user.name,
        currentUserPhoto:user.photo,
        id: req.userData.id
    }
    totalTags.push(user.interests);
    let newTag=[];
    for(let i in totalTags)
    {
        for(let j in totalTags[i])
        {
            newTag.push(totalTags[i][j]);
        }
    }
    const unique=Array.from(new Set(newTag));
    let categories=[];
    for(let k in unique)
    {
        let catInfo=await Category.find({title:unique[k]});

        if(catInfo.length===0)
        {
            categories.push({title:unique[k],description:"All About "+`${unique[k]}`+" Posts"});
        }

    }
    await Category.insertMany(categories);



res.render('home',{
    posts:allPosts,
    userInfo:user,
    tags:unique
});

}));

module.exports=Router;