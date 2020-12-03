const express = require("express");
const Router = express.Router();
const Validation=require('../validations/user');
const User=require('../models/user');
const Post=require('../models/post');
const bcrypt=require('bcrypt');
const _=require('lodash');
const multer = require('multer');
const forgotPassword=require('../models/forgotPassword');
const msg91=require('../helper/otp');
const Config=require('../config/config');
const asyncMiddleware=require('../middleware/async');
const jwt=require('jsonwebtoken');
const auth=require('../middleware/auth');
const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const entityStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');// check for correct permission
  },
  filename: (req, file, cb) => {
    const name = 'file-' + Date.now() + '-' + file.originalname;
    cb(null,  name);
  }
});

const upload = multer({storage: entityStorage});



Router.get('/signUp', function(req, res){
    res.render('SignUp');
});

Router.get('/logIn', function(req, res){
    res.render('logIn');
});

Router.get('/:token',auth,asyncMiddleware(async(req,res)=>{
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

    // res.render('home',{
    //     data:allPosts
    // });
    // const token=req.header('x-auth-token');
    // console.log(token);
    // res.send(token);
    res.render('home');


}));
Router.post('/signUp',asyncMiddleware(async(req,res)=>{
        let obj={
          name:req.body.name,
          email:req.body.email,

        }
        let error=await Validation.validateUser(obj);
        
        if (error.isJoi) res.status(401).json({
            status: "Failed",
            message: error.details[0].message
        });
        let checPass=await Validation.validatePassword(req.body.password);
        if(checPass==false)
        {
          res.status(401).json({status:'Failed',message:'Invalid Password Entry! Retry'});
        }
        let checkEUser=await User.findOne({email:req.body.email});
        if(checkEUser) res.status(401).json({status:'Failed',message:'User is already registered!'});
        let finalObj={
            name:req.body.name,
            email:req.body.email,
            password:req.body.password,
            about:req.body.profession,
            dob:req.body.dob
            
        }
        let newUser=new User(finalObj);
        const salt=await bcrypt.genSalt(10);
        newUser.password=await bcrypt.hash(newUser.password,salt);
        await newUser.save();
        res.render('logIn');
}));

Router.post('/logIn',asyncMiddleware(async(req,res)=>{
  let email=req.body.email;
  if (email.length<10) res.status(401).json({
    status: "Failed",
    message: "Length is less than 10"
});
let checkUser=await User.findOne({email:email});
if(!checkUser) res.status(401).json({
  status: "Failed",
  message: "User not found"
});

const validPassword=await bcrypt.compare(req.body.password,checkUser.password);
    if(!validPassword) return res.status(400).send('Invalid password');

    const token = jwt.sign(
        {
            email: email,
            id: checkUser._id
        },
        Config.JWT_KEY,
        {
            expiresIn: Config.jwtExpiresIn
        }
    )

// console.log(res.header('auth-token',token));
res.render('webToken',{
    token:token
});

//     console.log(res.header('x-auth-token',token));

}));


Router.post('/forgotPas/byPhone',asyncMiddleware(async(req,res)=>{
      let phone=req.body.phone;
      if(phone.length<10 && phone.length>10)
      {
        return res.status(401).json({
          status: "Failed",
          message: "Phone number invalid"
        });
      }
      let userInfo=await User.findOne({phone:phone});
      if(userInfo)
      {
        let code=Math.floor(1000 + Math.random() * 9000);
        const newForPas=new forgotPassword({
          user:userInfo._id,
          phone:userInfo.phone,
          code:code
        });
        await newForPas.save();
        await forgotPassword.updateOne({_id:newForPas._id},{$set:{status:true}});
        let Send=await msg91.sendOTP(code,phone);
        if(Send.type!="success")
        {
          return res.status(401).json({
            status: "Failed",
            message: "Code Not Sent",
            name: userInfo.name,
           
        });
        }
        else{
          return res.status(200).json({
            status: "Success",
            message: "Code Sent",
            name: userInfo.name,
            body:Send
        });
        }
      }

}));

Router.post('/otp',asyncMiddleware(async(req,res)=>{
    let code=req.body.code;
    let phone=req.body.phone;
    let doc=await forgotPassword.findOne({phone:phone,code:code,status:true});
    if(doc)
    {
      await forgotPassword.updateOne({phone:phone,status:true},{$set:{status:false}});
      return res.status(200).json({
        status: "Success",
        message: "Otp Verified!"
    });
    }
    else{
      return res.status(401).json({
        status: "Failed",
        message: "Otp Not Verified!"
    });
    }

}));


Router.post('/change-Password-otp',asyncMiddleware(async(req,res)=>{
      let newPass=req.body.newPass;
      let phone=req.body.phone;
      let code=req.body.code;
      let checPass=await Validation.validatePassword(newPass);
        if(checPass==false)
        {
          res.status(401).json({status:'Failed',message:'Invalid Password Entry! Retry'});
        }
      let doc=await forgotPassword.findOne({code:code,status:false,phone:phone});
      if(doc)
      {
        const salt=await bcrypt.genSalt(10);
        newPass=await bcrypt.hash(newPass,salt);
        let result=await User.updateOne({phone:phone},{$set:{password:newPass}});
        return res.status(200).json({
          status: "Success",
          message: "Password Successfully Changed!"
      });
      }
      else{
        return res.status(401).json({
          status: "Failed",
          message: "OTP not verified!"
      });
      }
}));


Router.post('/change-password-email',asyncMiddleware(async(req,res)=>{
    let email=req.body.email;
    let oldPas=req.body.oldPas;
    let newPas=req.body.newPas;
    let checPass=await Validation.validatePassword(newPass);
      if(checPass==false)
      {
          res.status(401).json({status:'Failed',message:'Invalid Password Entry! Retry'});
      }
    let doc=await User.findOne({email:email});
    if(doc)
    {
      const validPassword=await bcrypt.compare(oldPas,doc.password);
      if(!validPassword) return res.status(400).send('Invalid password');
      const salt=await bcrypt.genSalt(10);
      newPass=await bcrypt.hash(newPass,salt);
      await User.updateOne({email:email},{$set:{password:newPas}}); 
      return res.status(200).json({
        status: "Success",
        message: " Password Successfully Changed!"
    });
    }
    return res.status(401).json({
      status: "Failed",
      message: "User with given Email not found."
  });
}));

Router.post('/change/ProfilePic',upload.single('photo'),asyncMiddleware(async(req,res)=>{
      let email=req.body.email;
      let userInfo=await User.findOne({email:email});
      if(userInfo)
      {
        await User.updateOne({email:email},{$set:{photo:req.file.path}});
        return res.status(200).json({
          message: " Profile Picture Successfully Changed!"
      });
      }
      return res.status(401).json({
        status: "Failed",
        message: "User with given Email not found."
    });
}));

// Router.post('/update/userInfo/:id',async(req,res)=>{
//      let _id=re.params._id;
//      let userInfo=await User.findById(_id);
//      if(userInfo)
//      {

//      }
// });


module.exports=Router;