const express=require('express');
const home=require('../routes/home');
const user=require('../routes/users');
const answer=require('../routes/answers');
const posts=require('../routes/posts');
const category=require('../routes/category');
const bodyParser = require('body-parser');

module.exports=function(app){
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use('/api/users',user);
    app.use('/api/posts',posts);
    app.use('/api/answers',answer);
    app.use('/api/home',home);
    app.use('/api/category',category);

    
    
   
}











