const winston=require('winston');
const mongoose=require('mongoose');
require('winston-mongodb');

module.exports=function(){
    mongoose.connect('mongodb://localhost/miniquora')
        .then(() => winston.info('Connected to MongoDB...'));
}