const express = require("express");
const Router = express.Router();
const Validation=require('../validations/user');
const User=require('../models/user');
const bcrypt=require('bcrypt');
const _=require('lodash');
const multer = require('multer');
const forgotPassword=require('../models/forgotPassword');
const msg91=require('../helper/otp');

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



Router.post('/signUp',upload.single('photo'),async(req,res)=>{
        let obj={
          name:req.body.name,
          email:req.body.email,
          phone:req.body.phone
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
            phone:req.body.phone,
            password:req.body.password,
            about:req.body.profession,
            photo:req.file.path
        }
        let newUser=new User(finalObj);
        const salt=await bcrypt.genSalt(10);
        newUser.password=await bcrypt.hash(newUser.password,salt);
        await newUser.save(); 
        // const token=newUser.generateAuthToken();
        res.send(_.pick(newUser, ['_id', 'name', 'email']));
});

Router.get('/logIn',async(req,res)=>{
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

 const token=checkUser.generateAuthToken();
 return res.status(200).json({
  name: checkUser.name,
  email:checkUser.email,
  token:token
 
});
});


Router.post('/forgotPas/byPhone',async(req,res)=>{
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

});


Router.post('/otp',async(req,res)=>{
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

});


Router.post('/change-Password',async(req,res)=>{
      let newPass=req.body.newPass;
      let phone=req.body.phone;
      let code=req.body.code;
      let doc=await forgotPassword.findOne({code:code,status:false,phone:phone});
      if(doc)
      {
        const salt=await bcrypt.genSalt(10);
        newPass=await bcrypt.hash(newPass,salt);
        let result=await User.updateOne({phone:phone},{$set:{password:newPass}});
        return res.status(200).json({
          status: "Succes",
          message: "Successfully Password Changed"
      });
      }
      else{
        return res.status(401).json({
          status: "Failed",
          message: "OTP not verified!"
      });
      }
});






module.exports=Router;