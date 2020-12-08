const express = require("express");
const Router = express.Router();
const Validation=require('../validations/user');
const User=require('../models/user');
const Post=require('../models/post');
const bcrypt=require('bcrypt');
const multer = require('multer');
const Config=require('../config/config');
const asyncMiddleware=require('../middleware/async');
const jwt=require('jsonwebtoken');
const localstorage=require('local-storage');
const auth=require('../middleware/auth');
const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

//Setting up multer for photo upload
const entityStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/');// check for correct permission
  },
  filename: (req, file, cb) => {
    const name = file.originalname;
    cb(null,  name);
  }
});

const upload = multer({storage: entityStorage});


//Rendering the Signup page
Router.get('/signUp', asyncMiddleware(function(req, res){
    res.render('SignUp');
}));

//Rendering the Login Page
Router.get('/logIn', asyncMiddleware(function(req, res){
    res.render('logIn');
}));

//Rendering and sending the Home page
Router.get('/',auth,asyncMiddleware(async(req,res)=>{
    let pageNo = req.query.pageNo;
    let user=await User.findById(req.userData.id);
    let limit = 10;
    let skipPosts = (pageNo-1)*limit;
    let posts=await Post.find({status:true}).sort({updatedAt:-1}).skip(skipPosts).limit(limit)
        .populate('postBy')
        .populate('answers.answerId');
    let allPosts=[];
    let totalTags=[];
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
                postByPhoto:posts[i].postBy.photo,
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
            totalTags.push(posts[i].tags);
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
                userPhoto: posts[i].postBy.photo,
            };
            allPosts.push(obj);
            totalTags.push(posts[i].tags);
        }
    }
     user={
        currentUser:user.name,
        currentUserPhoto:user.photo,
        id: req.userData.id
    }
    totalTags.push(user.interests);
    let newTag=[];
    for(let i in totalTags)
    {
        for(let j in totalTags[i])
        {
            newTag.push(totalTags[i][j]);
        }
    }
    const unique=Array.from(new Set(newTag));
    console.log(unique);
res.render('home',{
    posts:allPosts,
    userInfo:user,
    tags:unique
});

}));

//Sign Up Route
Router.post('/signUp',asyncMiddleware(async(req,res)=>{
        let obj={
          name:req.body.name,
          email:req.body.email,

        }
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
            dob:req.body.dob
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
  if (email.length<5) return res.status(401).json({
    status: "Failed",
    message: "Length is less than 10"
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
    res.redirect('/api/users');
}));

//Logout Route
Router.get('/logout',asyncMiddleware(async(req,res)=>{
    localstorage.clear();
    res.render('logIn');
}));

Router.get('/change/profilePic',asyncMiddleware(async(req,res)=>{
    res.render('uploadProfilePic');
}))

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
                password:newPas,
                about:req.body.profession
            }
        }
        await User.updateOne({email:email},newDoc);
        localstorage.clear();
        res.render('logIn');
    }
    return res.status(401).json({
        status: "Failed",
        message: "User with given Email not found."
    });
}));

//Changing profile pic
Router.post('/change/ProfilePic',auth,upload.single('photo'),asyncMiddleware(async(req,res)=>{
    let email=req.userData.email;
    // let userInfo=req.body.email;
    let id=req.userData.id;
    let user=await User.findById(id);
    let path=req.file.path;
    path=path.replace(/\\/g,"/");
    let imageName=path.slice(7);


    let imageFullPath=await Validation.manipulateImage(path,imageName);

    if(email)
    {
        await User.updateOne({email:email},{$set:{photo:imageFullPath}});
        let UserInfo={
            userName:user.name,
            userEmail:user.email,
            userDob:user.dob,
            userProfession:user.about,
            userPhoto:imageFullPath,
            userPassword:user.password

        };
        res.render('Profile',{
            userInfo:UserInfo
        });
    }
    return res.status(401).json({

    });
}));

Router.get('/:id',asyncMiddleware(async(req,res)=>{
    let user=await User.findById(req.params.id);

    let UserInfo={
        userName:user.name,
        userEmail:user.email,
        userDob:user.dob,
        userProfession:user.about,
        userPhoto:user.photo,
        userPassword:user.password

    };
    res.render('Profile',{
        userInfo:UserInfo
    })
}));

// Router.post('/forgotPas/byPhone',asyncMiddleware(async(req,res)=>{
//       let phone=req.body.phone;
//       if(phone.length<10 && phone.length>10)
//       {
//         return res.status(401).json({
//           status: "Failed",
//           message: "Phone number invalid"
//         });
//       }
//       let userInfo=await User.findOne({phone:phone});
//       if(userInfo)
//       {
//         let code=Math.floor(1000 + Math.random() * 9000);
//         const newForPas=new forgotPassword({
//           user:userInfo._id,
//           phone:userInfo.phone,
//           code:code
//         });
//         await newForPas.save();
//         await forgotPassword.updateOne({_id:newForPas._id},{$set:{status:true}});
//         let Send=await msg91.sendOTP(code,phone);
//         if(Send.type!="success")
//         {
//           return res.status(401).json({
//             status: "Failed",
//             message: "Code Not Sent",
//             name: userInfo.name,
//
//         });
//         }
//         else{
//           return res.status(200).json({
//             status: "Success",
//             message: "Code Sent",
//             name: userInfo.name,
//             body:Send
//         });
//         }
//       }
//
// }));
//
// Router.post('/otp',asyncMiddleware(async(req,res)=>{
//     let code=req.body.code;
//     let phone=req.body.phone;
//     let doc=await forgotPassword.findOne({phone:phone,code:code,status:true});
//     if(doc)
//     {
//       await forgotPassword.updateOne({phone:phone,status:true},{$set:{status:false}});
//       return res.status(200).json({
//         status: "Success",
//         message: "Otp Verified!"
//     });
//     }
//     else{
//       return res.status(401).json({
//         status: "Failed",
//         message: "Otp Not Verified!"
//     });
//     }
//
// }));
//
//
// Router.post('/change-Password-otp',asyncMiddleware(async(req,res)=>{
//       let newPass=req.body.newPass;
//       let phone=req.body.phone;
//       let code=req.body.code;
//       let checPass=await Validation.validatePassword(newPass);
//         if(checPass==false)
//         {
//           res.status(401).json({status:'Failed',message:'Invalid Password Entry! Retry'});
//         }
//       let doc=await forgotPassword.findOne({code:code,status:false,phone:phone});
//       if(doc)
//       {
//         const salt=await bcrypt.genSalt(10);
//         newPass=await bcrypt.hash(newPass,salt);
//         let result=await User.updateOne({phone:phone},{$set:{password:newPass}});
//         return res.status(200).json({
//           status: "Success",
//           message: "Password Successfully Changed!"
//       });
//       }
//       else{
//         return res.status(401).json({
//           status: "Failed",
//           message: "OTP not verified!"
//       });
//       }
// }));




// Router.post('/update/userInfo/:id',async(req,res)=>{
//      let _id=re.params._id;
//      let userInfo=await User.findById(_id);
//      if(userInfo)
//      {

//      }
// });


module.exports=Router;