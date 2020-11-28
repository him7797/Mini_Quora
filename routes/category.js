const express = require("express");
const Router = express.Router();
const multer=require('multer');
const Category=require('../models/category');
const Post=require('../models/post');
const User=require('../models/user');
const asyncMiddleware=require('../middleware/async');
const entityStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'catUploads/');// check for correct permission
    },
    filename: (req, file, cb) => {
      const name = 'file-' + Date.now() + '-' + file.originalname;
      cb(null,  name);
    }
  });
  
  const upload = multer({storage: entityStorage});

Router.post('/',upload.single('photo'),asyncMiddleware(async(req,res)=>{
    let title=req.body.title;
    let description=req.body.description;
    let obj={
        title:title,
        description:description,
        photo:req.file.path
    };
  let newCat=new Category(obj);
  let result=await newCat.save();
  res.send(result);
}));

Router.get('/by/:id',asyncMiddleware(async(req,res)=>{
    let cat=await Category.findById(req.params.id);
    let catTitle=cat.title;
    let posts=await Post.find({tags:{$all:[`${catTitle}`]}}).sort({updatedAt:-1});
    console.log(posts);
    let obj={
        title:catTitle,
        description:cat.description,
        photo:cat.photo,
        followers:cat.followersCount,
        questions:posts
    }
    res.send(obj);
}));

Router.post('/follow/:id',asyncMiddleware(async(req,res)=>{
    let cat=await Category.findById(req.params.id);
    let followCount=cat.followersCount+1;
    cat.followersCount=followCount;
    await cat.save();
    let userId=req.body.id;
    let userInfo=await User.findById(userId);
    await User.updateOne({_id:userInfo},{$push:{following:cat.title}});
    res.send('Success');

}));

Router.get('/:id',asyncMiddleware(async(req,res)=>{
    let userInfo=await Post.findById(req.params.id);
    const Path="F:\MiniQuora\Mini_Quora";
    let filepath=path+userInfo.photo;
    res.sendFile(filepath);
}));


module.exports=Router;