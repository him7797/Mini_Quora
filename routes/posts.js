const express = require("express");
const Router = express.Router();
const multer = require('multer');
const Post=require('../models/post');
const User=require('../models/user');
const asyncMiddleware=require('../middleware/async');
const auth=require('../middleware/auth');
const Cat=require('../models/category');
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "June",
    "July", "Aug", "Sep", "Oct", "Nov", "Dec"
];

// const entityStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, 'PostsUploads/');// check for correct permission
//     },
//     filename: (req, file, cb) => {
//       const name = 'file-' + Date.now() + '-' + file.originalname;
//       cb(null,  name);
//     }
//   });
//
//   const upload = multer({storage: entityStorage});



Router.post('/',auth,asyncMiddleware(async(req,res)=>{
   let title=req.body.title;
   let tags=req.body.tags;
   let postBy=req.userData.id;
   if(title.length<1||tags.length<1)
   {

   }
   //  let postBy=req.body.id;
   let obj={
       title:title,
       tags:tags,
       postBy:postBy,
   }

   let doc=new Post(obj);
   let result=await doc.save();
   let updateDoc={
     $push:{
      posts:[{postId:result._id}]
     }
     ,
      $addToSet:
      {
        interests:tags
      }
    };
   await User.updateOne({_id:postBy},updateDoc);
   // res.send('success');
   res.redirect('/api/users/');
}));


Router.get('/',asyncMiddleware(async(req,res)=>{
   let result=await Post.find().populate('postBy');
   res.send(result);
}));


Router.get('/:id',auth,asyncMiddleware(async(req,res)=>{
  let posts=await Post.findById(req.params.id).populate('postBy').populate('answers.answerId');
  let user=await User.findById(req.userData.id);
  let catIds=await Cat.find().sort({updatedAt:-1});
  let catInfo=[];
  user={
        currentUser:user.name,
        currentUserPhoto:user.photo,
        id: req.userData.id
   }
let allAnswers=[];
        if (posts.answers.length > 0) {
            for(let i in posts.answers)
            {
                let answerUser = await User.findById(posts.answers[i].answerId.createdBy);
                let answerName = answerUser.name;
                let answerProfession=answerUser.about;
                let answerPhoto=answerUser.photo;

                let obj;
                obj = {
                    answerName: answerName,
                    answerProfession:answerProfession,
                    answerPhoto:answerPhoto,
                    answerId:posts.answers[i].answerId._id,
                    totalLikes: posts.answers[i].answerId.totalLikes,
                    description: posts.answers[i].answerId.description,
                    answerYear:posts.answers[i].answerId.createdAt.getFullYear(),
                    answerMonth:monthNames[posts.answers[i].answerId.createdAt.getMonth()],
                    answerDate:posts.answers[i].answerId.createdAt.getDate()

                };
                allAnswers.push(obj);

            }

        }
let postInfo={
    title: posts.title,
    totalAnswers: posts.totalAnswers,
    tags: posts.tags,
    id:posts._id,
    userId:posts.postBy._id,
    postBy: posts.postBy.name,
    postLike:posts.totalLikes,
    profession: posts.postBy.about,
    postYear: posts.createdAt.getFullYear(),
    postMonth: monthNames[posts.createdAt.getMonth()],
    postDate: posts.createdAt.getDate(),
    postByPhoto: posts.postBy.photo,
};

     for(let j in catIds)
     {
         catInfo.push(catIds[j].title);
     }

  res.render('answer',{
      answers:allAnswers,
      userInfo:user,
      posts:postInfo,
      cat:catInfo
  })
}));

Router.delete('/:id',asyncMiddleware(async(req,res)=>{
    let post=await  Post.findById(req.params.id);
    if(post)
    {
        await Post.updateOne({_id:req.params.id},{$set:{status:false}});
        return res.status(200).json({
            status: "Success",
            message: 'Post Deleted Successfully'
        });
    }
    return res.status(401).json({
        status: "Failed",
        message: 'Post Not  Found'
    });
}));

Router.get('/like/:id',auth,asyncMiddleware(async(req,res)=>{
    let userId=req.userData.id;
    let postId=req.params.id;
    let checkLike=await Post.find({$and:[{_id:postId},{"likesBy.likedBy":userId},{"likesBy.likeStatus":true}]});
    console.log(checkLike);
    if(checkLike.length>0) return res.status(409).json({
        status: "Failed",
        message: 'Post Already Liked'
    });
    else
    {
        let obj;
        obj={
            $addToSet:{
                likesBy:{
                    likedBy:userId,
                    createdAt:Date.now(),
                    likeStatus:true
                },
            },
            $inc:{
                totalLikes:1
            }
        };
        await Post.updateOne({_id:postId},obj);
        res.redirect('/api/users/');
    }
}));

















module.exports=Router;