const jwt=require('jsonwebtoken');
const Config=require('../config/config');
const localstorage=require('localStorage');
module.exports=function (req,res,next){
    const token =localstorage.getItem('token');

    if(!token) return res.status(401).send('Access denied no token provided');
    try{
        req.userData = jwt.verify(token, Config.JWT_KEY);

        console.log( req.userData);
        next();
    }
    catch(error){
        return res.status(401).json({
            status: "Failed",
            message: 'Please login to continue'
        });
    }
    
}
