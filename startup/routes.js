const express=require('express');
const router = express.Router();
const home=require('../routes/home');
const user=require('../routes/users');
const answer=require('../routes/answers');
const posts=require('../routes/posts');
const auth=require('../middleware/auth');
const category=require('../routes/category');

module.exports=function(app){
    app.use(express.json());
    app.use('/api/users',user);
    app.use('/api/posts',posts);
    app.use('/api/answers',answer);
    app.use('/api/home',home);
    app.use('/api/category',category);
    
    
   
}











