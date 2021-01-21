const express = require("express");
const Router = express.Router();
const multer=require('multer');
const Category=require('../models/category');
const Post=require('../models/post');
const User=require('../models/user');
const asyncMiddleware=require('../middleware/async');
const auth=require('../middleware/auth');
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "June",
    "July", "Aug", "Sep", "Oct", "Nov", "Dec"
];

// const entityStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, 'catUploads/');// check for correct permission
//     },
//     filename: (req, file, cb) => {
//       const name = 'file-' + Date.now() + '-' + file.originalname;
//       cb(null,  name);
//     }
//   });
//
//   const upload = multer({storage: entityStorage});

Router.post('/',asyncMiddleware(async(req,res)=>{
    let title=req.body.title;
    let catInfo=await Category.find({title:title});
    if(catInfo.length>0)
    {
        return res.status(409).json({
            status: "Failed",
            message: "Title is already available."
        });
    }
    let description=req.body.description;
    let obj={
        title:title,
        description:description,
    };
  let newCat=new Category(obj);
  let result=await newCat.save();
  res.send(result);
}));

Router.get('/by/:title',auth,asyncMiddleware(async(req,res)=>{
    let cat=await Category.findOne({title:req.params.title});
    let userInfo=await User.findById(req.userData.id);
    let catIds=await Category.find().sort({updatedAt:-1});
    let catInfo=[];
    let info;
    if(userInfo.following.length>0)
    {
        if(userInfo.following.includes(req.params.title))
        {
            info=true;
        }
        else
        {
            info=false;
        }
    }
    let catTitle=cat.title;
    let posts=await Post.find({tags:{$all:[`${catTitle}`]}}).sort({updatedAt:-1}).populate('postBy');
    let catObj={
        title:catTitle,
        description:cat.description,
        followers:cat.followersCount,
        questions:posts,
        totalPosts:posts.length
    };
    let postsInfo=[];
    for(let i in posts)
    {
        let postObj={
            name:posts[i].postBy.name,
            profession:posts[i].postBy.about,
            postByPhoto:posts[i].postBy.photo,
            title:posts[i].title,
            id:posts[i]._id,
            postYear: posts[i].createdAt.getFullYear(),
            postMonth: monthNames[posts[i].createdAt.getMonth()],
            postDate: posts[i].createdAt.getDate(),
            tags: posts[i].tags,
            totalAnswers: posts[i].totalAnswers,
            postLike:posts[i].totalLikes,
        };
        postsInfo.push(postObj);
    }
    userInfo={
        currentUser:userInfo.name,
        currentUserPhoto:userInfo.photo,
        id: req.userData.id
    };
    for(let j in catIds)
    {
        catInfo.push(catIds[j].title);
    }
    res.render('category',{
        posts:postsInfo,
        userInfo:userInfo,
        info:info,
        catObj:catObj,
        cat:catInfo


    });

}));

//Cat followed by user logged in
Router.get('/follow/:title',auth,asyncMiddleware(async(req,res)=>{
    let cat=req.params.title;
    let user=req.userData.id;
    let updateDoc={
        $addToSet:{
            following:req.params.title
        }
    };
    await User.updateOne({_id:user},updateDoc);
    await Category.updateOne({title:cat},{$inc:{followersCount:1}});
    res.redirect('/home');

}));



module.exports=Router;