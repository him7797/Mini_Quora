const config=require('config');

module.exports=function(){
    if(!config.get('saviour')){
        throw new Error('FATAL ERROR:jwtPrivateKey is not defined');
    
    }
}