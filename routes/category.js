const express = require("express");
const Router = express.Router();
const multer=require('multer');
const Category=require('../models/category');
const Post=require('../models/post');
const User=require('../models/user');
const asyncMiddleware=require('../middleware/async');
const auth=require('../middleware/auth');

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

Router.get('/by/:title',asyncMiddleware(async(req,res)=>{
    let cat=await Category.findOne({title:req.params.title});
    let catTitle=cat.title;
    let posts=await Post.find({tags:{$all:[`${catTitle}`]}}).sort({updatedAt:-1});
    let obj={
        title:catTitle,
        description:cat.description,
        followers:cat.followersCount,
        questions:posts
    }
    res.send(obj);
}));

//Cat followed by user logged in
Router.post('/follow/:id',auth,asyncMiddleware(async(req,res)=>{
    let cat=await Category.findById(req.params.id);
    let followCount=cat.followersCount+1;
    cat.followersCount=followCount;
    await cat.save();
    let userId=req.userData;
    let userInfo=await User.findById(userId.id);
    await User.updateOne({_id:userInfo},{$push:{following:[{followingId:result._id}]}});
    res.send('Success');

}));

Router.get('/:id',asyncMiddleware(async(req,res)=>{
    let userInfo=await Post.findById(req.params.id);
    const Path="F:\MiniQuora\Mini_Quora";
    let filepath=path+userInfo.photo;
    res.sendFile(filepath);
}));


module.exports=Router;