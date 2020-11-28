const jwt=require('jsonwebtoken');
const config=require('config');
module.exports=function (req,res,next){
    const token=req.header('x-auth-token');
    console.log(token);
    if(!token) return res.status(401).send('Access denied no token provided');
    try{
        const decoded=jwt.verify(token,config.get('jwtPrivateKey'));
        req.user=decoded;
        next();
    }
    catch(error){
        return res.status(401).json({
            status: "Failed",
            message: 'Please login to continue'
        });
    }
    
}
