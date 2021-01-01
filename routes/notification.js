const express=require('express');
const Router=express.Router();
const asyncMiddleware=require('../middleware/async');
const auth=require('../middleware/auth');
const Post=require('../models/post');
const Answer=require('../models/answer');
const User=require('../models/user');
const Cat=require('../models/category');


Router.get('/',auth,asyncMiddleware(async(req,res)=>{
// let user=req.body.id;
let user=req.userData.id;
let userInfo=await User.findById(user).populate('posts.postId').populate('answers.answerId');
let catIds=await Cat.find().sort({updatedAt:-1});
let catInfo=[];
let posts=userInfo.posts;
let answers=userInfo.answers;
// console.log(posts);
// console.log(answers);
//
//
// let answersLikesIds=[];
let postAnswersIds=[];
let postLikes=[];
let answerLike=[];
for(let i in posts)
{
    for(let j in posts[i].postId.answers)
    {
        if(posts[i].postId.answers[j].createdBy!=user)
        {
            postAnswersIds.push(posts[i].postId.answers[j].createdBy);
        }
    }

}
for(let i in posts)
{
    if(posts[i].postId.totalLikes>0)
    {
        for(let j in posts[i].postId.likesBy)
        {
            if(posts[i].postId.likesBy[j].likedBy!=user)
            {
                postLikes.push(posts[i].postId.likesBy[j].likedBy);
            }

        }
    }

}
for(let i in answers)
{
    if(answers[i].answerId.totalLikes>0)
    {

        for(let j in answers[i].answerId.likesBy)
        {
            if(answers[i].answerId.likesBy[i].likedBy!=user)
            {
                answerLike.push(answers[i].answerId.likesBy[i].likedBy);
            }

        }
    }
}
let finalRes=[];
let allAnswerLikes;
let allPostslikes;
let allAnswered;
if(answerLike.length>0)
{
    allAnswerLikes=await User.find({_id:answerLike});
    for(let i in allAnswerLikes)
    {
        let obj;
        obj={
            name:allAnswerLikes[i].name,
            photo:allAnswerLikes[i].photo,
            description:"Liked Your Answer"
        };
        finalRes.push(obj);
    }
}
if(postLikes.length>0)
{
    allPostslikes=await User.find({_id:postLikes});
    for(let i in allPostslikes)
    {
        let obj;
        obj={
            name:allPostslikes[i].name,
            photo:allPostslikes[i].photo,
            description:"Liked Your Post"
        };
        finalRes.push(obj);
    }
}
if(postAnswersIds.length>0)
{
    allAnswered=await User.find({_id:postAnswersIds});
    for(let i in allAnswered)
    {
        let obj;
        obj={
            name:allAnswered[i].name,
            photo:allAnswered[i].photo,
            description:"Answered Your Question"
        };
        finalRes.push(obj);
    }
}
    for(let j in catIds)
    {
        catInfo.push(catIds[j].title);
    }

    userInfo={
        currentUser:userInfo.name,
        currentUserPhoto:userInfo.photo,
        id: req.userData.id
    }
// console.log(postAnswersIds);
// console.log(postLikes);

   res.render('notification',{
       allInfo:finalRes,
       cat:catInfo,
       userInfo:userInfo
   });
}));


Router.get('/following',auth,asyncMiddleware(async(req,res)=>{
    // console.log(req.userData.id);
    let user=await User.findById(req.userData.id);

    let cat;
    if(user.following.length>0)
    {
        cat=await Cat.find({title:user.following}).sort({updatedAt:-1});
    }

    let catIds=await Cat.find().sort({updatedAt:-1});
    let catInfo=[];
    let finalRes=[];
    for(let i in cat)
    {
        let posts=await Post.find({tags:{$all:[`${cat[i].title}`]}});
        let obj;
        obj={
            title:cat[i].title,
            totalPosts:posts.length,
            totalFollowers:cat[i].followersCount
        };
        finalRes.push(obj);
    }
    for(let j in catIds)
    {
        catInfo.push(catIds[j].title);
    }
    user={
        currentUser:user.name,
        currentUserPhoto:user.photo,
        id: req.userData.id
    };
    res.render('following',{
       finalRes: finalRes,
        userInfo:user,
        cat:catInfo

    });

}));





module.exports=Router;