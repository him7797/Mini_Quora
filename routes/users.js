const express = require("express");
const Router = express.Router();
const Validation=require('../validations/user');
// const forgotPassword=require('../models/forgotPassword');
const User=require('../models/user');
const Post=require('../models/post');
// const msg91=require('../helper/otp');
const bcrypt=require('bcrypt');
const Category=require('../models/category');
const multer = require('multer');
const Config=require('../config/config');
const asyncMiddleware=require('../middleware/async');
const jwt=require('jsonwebtoken');
const localstorage=require('local-storage');
const auth=require('../middleware/auth');
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "June",
    "July", "Aug", "Sep", "Oct", "Nov", "Dec"
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
    let user=await User.findById(req.userData.id);
    let posts=await Post.find({status:true}).sort({updatedAt:-1}).populate('postBy').populate('answers.answerId');
    let allPosts=[];
    let totalTags=[];
    for(let i in posts) {
        if (posts[i].answers.length > 0) {
            let answerUser = await User.findById(posts[i].answers[0].answerId.createdBy);
            let answerName = answerUser.name;
            let answerProfession=answerUser.about;
            let answerPhoto=answerUser.photo;
            let obj;
            obj = {
                title: posts[i].title,
                totalAnswers: posts[i].totalAnswers,
                tags: posts[i].tags,
                id:posts[i]._id,
                answerId:answerUser._id,
                answerIds:posts[i].answers[0].answerId._id,
                userId:posts[i].postBy._id,
                postBy: posts[i].postBy.name,
                postByPhoto:posts[i].postBy.photo,
                profession: posts[i].postBy.about,
                answerName: answerName,
                postLike:posts[i].totalLikes,
                answerProfession:answerProfession,
                answerPhoto:answerPhoto,
                totalLikes: posts[i].answers[0].answerId.totalLikes,
                description: posts[i].answers[0].answerId.description,
                postYear: posts[i].createdAt.getFullYear(),
                postMonth: monthNames[posts[i].createdAt.getMonth()],
                postDate: posts[i].createdAt.getDate(),
                answerYear:posts[i].answers[0].answerId.createdAt.getFullYear(),
                answerMonth:monthNames[posts[i].answers[0].answerId.createdAt.getMonth()],
                answerDate:posts[i].answers[0].answerId.createdAt.getDate()

            };
            allPosts.push(obj);
            totalTags.push(posts[i].tags);
        } else {
            let obj;
            obj = {
                title: posts[i].title,
                totalAnswers: posts[i].totalAnswers,
                tags: posts[i].tags,
                id:posts[i]._id,
                userId:posts[i].postBy._id,
                postBy: posts[i].postBy.name,
                postLike:posts[i].totalLikes,
                profession: posts[i].postBy.about,
                postYear: posts[i].createdAt.getFullYear(),
                postMonth: monthNames[posts[i].createdAt.getMonth()],
                postDate: posts[i].createdAt.getDate(),
                postByPhoto: posts[i].postBy.photo,
                description:"Be the first one to answer!",
                totalLikes:0
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
    let categories=[];
    for(let k in unique)
    {
        let catInfo=await Category.find({title:unique[k]});

        if(catInfo.length===0)
        {
            categories.push({title:unique[k],description:"All About "+`${unique[k]}`+" Posts"});
        }

    }
    await Category.insertMany(categories);



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
            photo:'/public/Baby Yoda.jpeg'
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

Router.get('/profilePic',asyncMiddleware(async(req,res)=>{
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
    let Path=req.file.path;
    Path=Path.replace(/\\/g,"/");
    Path='/'.concat(Path);
    console.log(Path);
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
        res.render('Profile',{
            userInfo:UserInfo
        });
    }
    return res.status(401).json({
         'message':"User with given email not found"
    });
}));

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
    })
}));

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

// Router.post('/forgotPas/byPhone',asyncMiddleware(async(req,res)=>{
//       let phone=req.body.phone;
//       if(phone.length<10 && phone.length>10)
//       {
//         return res.status(401).json({
//           status: "Failed",
//           message: "Phone number invalid"
//         });
//       }
//       // let userInfo=await User.findOne({phone:phone});
//
//         let code=Math.floor(1000 + Math.random() * 9000);
//         // const newForPas=new forgotPassword({
//         //   user:userInfo._id,
//         //   phone:userInfo.phone,
//         //   code:code
//         //
//         // await newForPas.save();
//         // await forgotPassword.updateOne({_id:newForPas._id},{$set:{status:true}});
//         let Send=await msg91.sendOTP(code,phone);
//         if(Send.type!="success")
//         {
//           return res.status(401).json({
//             status: "Failed",
//             message: "Code Not Sent",
//               body:Send
//
//
//         });
//         }
//         else{
//           return res.status(200).json({
//             status: "Success",
//             message: "Code Sent",
//
//             body:Send
//         });
//         }
//       }));
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