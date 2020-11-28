const express = require("express");
const Router = express.Router();
const multer = require('multer');
const Post=require('../models/post');
const User=require('../models/user');
const asyncMiddleware=require('../middleware/async');
// const bodyParser = require('body-parser');
// app.use(bodyParser.urlencoded({ extended: false }));
// // parse application/json
// app.use(bodyParser.json());


const entityStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'PostsUploads/');// check for correct permission
    },
    filename: (req, file, cb) => {
      const name = 'file-' + Date.now() + '-' + file.originalname;
      cb(null,  name);
    }
  });
  
  const upload = multer({storage: entityStorage});



Router.post('/',upload.single('photo'),asyncMiddleware(async(req,res)=>{
   let title=req.body.title;
   let tags=req.body.tags;
   let postBy=req.body.postBy;
   
   let obj={
       title:title,
       tags:tags,
       postBy:postBy,
       photo:req.file.path
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
    }
   await User.updateOne({_id:postBy},updateDoc);
   res.send(result);
}));


Router.get('/',asyncMiddleware(async(req,res)=>{
   let result=await Post.find().populate('postBy');
   res.send(result);
}));


Router.get('/:id',asyncMiddleware(async(req,res)=>{
  let post=await Post.findById(req.params.id).populate('postBy').populate('answers.answerId');
  res.send(post);
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



















module.exports=Router;