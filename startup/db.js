const winston=require('winston');
const mongoose=require('mongoose');
require('winston-mongodb');



module.exports=function(){
    mongoose.connect('mongodb+srv://Himanshu:HIM101hi@miniquora.ztdid.mongodb.net/miniquora?retryWrites=true&w=majority',{useNewUrlParser: true})
        .then(() => winston.info('Connected to MongoDB...'));
}