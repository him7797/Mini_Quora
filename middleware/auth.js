const jwt=require('jsonwebtoken');
const Config=require('../config/config');
const localstorage=require('local-storage');
module.exports=function (req,res,next){
    const token =localstorage.get('token');

    if(!token) return res.status(401).send('Access denied no token provided Please login to continue');
    try{
        req.userData = jwt.verify(token, Config.JWT_KEY);
        next();
    }
    catch(error){
        return res.status(401).json({
            status: "Failed",
            message: 'Please login to continue'
        });
    }
}
