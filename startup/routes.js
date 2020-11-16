const express=require('express');
const router = express.Router();
const home=require('../routes/home');
const user=require('../routes/users');
const comment=require('../routes/comments');
const auth=require('../middleware/auth');

module.exports=function(app){
    app.use(express.json());
    app.use('/api/users',user);
    
    
    // app.use('/api/customerReviews',customReview);
   
}
// router.use('/home',auth,home);










