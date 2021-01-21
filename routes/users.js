const express = require("express");
const Router = express.Router();
const Validation=require('../validations/user');
const User=require('../models/user');
// const Post=require('../models/post');
const bcrypt=require('bcrypt');
const Category=require('../models/category');
const multer = require('multer');
const Config=require('../config/config');
const asyncMiddleware=require('../middleware/async');
const jwt=require('jsonwebtoken');
const localstorage=require('local-storage');
const auth=require('../middleware/auth');
const crypto = require('crypto');
const mongoose = require('mongoose');
const sharp=require('sharp');

const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');


//Setting up multer for photo upload
const mongoURI = 'mongodb+srv://Himanshu:HIM101hi@miniquora.ztdid.mongodb.net/Uploads?retryWrites=true&w=majority';

// Create mongo connection
const conn = mongoose.createConnection(mongoURI);

// Init gfs
let gfs;

conn.once('open', () => {
    // Init stream
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
});

// Create storage engine
const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + file.originalname;
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads'
                };
                resolve(fileInfo);
            });
        });
    }
});
const upload = multer({ storage });




//Sign Up Route
Router.post('/signUp',asyncMiddleware(async(req,res)=>{
        let obj={
          name:req.body.name,
          email:req.body.email,

        };
        let error=await Validation.validateUser(obj);
        
        if (error.isJoi) return res.status(401).json({
            status: "Failed",
            message: error.details[0].message
        });
        let checPass=await Validation.validatePassword(req.body.password);
        if(checPass==false)
        {
          return res.status(401).json({status:'Failed',message:'Invalid Password Entry! Retry'});
        }
        let checkEUser=await User.findOne({email:req.body.email});
        if(checkEUser) return res.status(401).json({status:'Failed',message:'User is already registered!'});
        let finalObj={
            name:req.body.name,
            email:req.body.email,
            password:req.body.password,
            about:req.body.profession,
            dob:req.body.dob,
            photo:'43492e86ba2646b987b5c93a84741095.jpeg'
        }
        let newUser=new User(finalObj);
        const salt=await bcrypt.genSalt(10);
        newUser.password=await bcrypt.hash(newUser.password,salt);
        await newUser.save();
        res.render('logIn');
}));


//Login Route
Router.post('/logIn',asyncMiddleware(async(req,res)=>{
  let email=req.body.email;
  if (email.length<2) return res.status(401).json({
    status: "Failed",
    message: "Length is less than 2"
});
let checkUser=await User.findOne({email:email});
if(!checkUser) return res.status(401).json({
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
    localstorage.set('token',token);
    res.redirect('/home');
}));

//Logout Route
Router.get('/logout',asyncMiddleware(async(req,res)=>{
    localstorage.clear();
    res.render('logIn');
}));

Router.get('/profilePic',asyncMiddleware(async(req,res)=>{
    res.render('uploadProfilePic');
}));

//change password using email route
Router.post('/change-password-email',auth,asyncMiddleware(async(req,res)=>{
    let oldPas=req.body.oldPas;
    let newPas=req.body.newPas;
    let email=req.userData;
    email=email.email;
    let checkPass=await Validation.validatePassword(newPas);
    if(checkPass==false)
    {
        res.status(401).json({status:'Failed',message:'Invalid Password Entry! Retry'});
    }
    let doc=await User.findOne({email:email});
    if(doc)
    {
        const validPassword=await bcrypt.compare(oldPas,doc.password);
        if(!validPassword) return res.status(400).send('Wrong password');
        const salt=await bcrypt.genSalt(10);
        newPas=await bcrypt.hash(newPas,salt);
        let newDoc={
            $set:{
                password:newPas
            }
        }
        await User.updateOne({email:email},newDoc);
        
        res.redirect('/api/users/logout');
    }
    return res.status(401).json({
        status: "Failed",
        message: "User with given Email not found."
    });
}));

//Changing profile pic
Router.post('/change/ProfilePic',auth,upload.single('file'),asyncMiddleware(async(req,res)=>{
    let email=req.userData.email;
    // let userInfo=req.body.email;
    let id=req.userData.id;
    let user=await User.findById(id);
    let Path=req.file.filename;
    // Path=Path.replace(/\\/g,"/");
    // Path='/'.concat(Path);
    // console.log(Path);

    if(email)
    {
        await User.updateOne({email:email},{$set:{photo:Path}});
        let UserInfo={
            name:user.name,
            dob:user.dob,
            email:user.email,
            profession:user.about,
            photo:Path,

        };
        return res.render('Profile',{
            userInfo:UserInfo
        });
    }
    return res.status(401).json({
         'message':"User with given email not found"
    });
}));
Router.get('/image/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
     
  });
});
Router.get('/:id',auth,asyncMiddleware(async(req,res)=>{
    let user=await User.findById(req.params.id);
    let currentUser=await User.findById(req.userData.id);
    let catIds=await Category.find().sort({updatedAt:-1});
    let catInfo=[];
    let UserInfo={
        userName:user.name,
        userEmail:user.email,
        userDob:user.dob,
        userProfession:user.about,
        userPhoto:user.photo,
        totalPosts:user.posts.length,
        totalQuestionsAnswered:user.answers.length

    };
    for(let j in catIds)
    {
        catInfo.push(catIds[j].title);
    }
    currentUser={
        currentUser:currentUser.name,
        currentUserPhoto:currentUser.photo,
        id: req.userData.id
    }
    res.render('profilePage',{
        userInfo:UserInfo,
        cat:catInfo,
        currentUser:currentUser
    });
}));

//Edit Profile Of a User
Router.get('/editProfile/:id',auth,asyncMiddleware(async(req,res)=>{
        let user=await User.findById(req.params.id);
        let obj={
            name:user.name,
            dob:user.dob,
            email:user.email,
            profession:user.about,
            photo:user.photo,

        };
        res.render('Profile',{
            userInfo:obj
        });

}));




module.exports=Router;