const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const  passwordValidator = require('password-validator');
const schema = new passwordValidator();
const Jimp=require('jimp');
schema
.is().min(8)                                    // Minimum length 8
.is().max(100)                                  // Maximum length 100
.has().uppercase()                              // Must have uppercase letters
.has().lowercase()                              // Must have lowercase letters
.has().digits(1)
.has().symbols(1)                               // Must have at least 2 digits
.has().not().spaces()                           // Should not have spaces
.is().not().oneOf(['Passw0rd', 'Password123']);


module.exports={
    validateUser:async(userObj)=>{
        try {
            const schema = {
                name: Joi.string().min(3).max(50).required(),
                 email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
              };
              return await Joi.validate(userObj, schema);
        } catch (e) {
            return e;
        }
    
    },
    validatePassword:async(paasword)=>{
        try{
                return await schema.validate(paasword);
        }
        catch(e)
        {
            return e;
        }
    },
    manipulateImage:async(image,imageName)=>{
        const Image=await Jimp.read(`${image}`);

        Image.resize(80, 80);
        Image.write('public/'+'edited-'+`${imageName}`);
        return "/public/edited-"+`${imageName}`;
    }
    
        
};