const express = require("express");
const Router = express.Router();
const Validation=require('../validations/user');
const User=require('../models/user');
const bcrypt=require('bcrypt');
const _=require('lodash');
const multer = require('multer');

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
        const token=newUser.generateAuthToken();
        res.header('x-auth-token', token).send(_.pick(newUser, ['_id', 'name', 'email']));
});

Router.get('/',async(req,res)=>{
  
})


module.exports=Router;