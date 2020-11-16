const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const  passwordValidator = require('password-validator');
const schema = new passwordValidator();
schema
.is().min(8)                                    // Minimum length 8
.is().max(100)                                  // Maximum length 100
.has().uppercase()                              // Must have uppercase letters
.has().lowercase()                              // Must have lowercase letters
.has().digits(2) 
.has().symbols(1)                               // Must have at least 2 digits
.has().not().spaces()                           // Should not have spaces
.is().not().oneOf(['Passw0rd', 'Password123']);


module.exports={
    validateUser:async(userObj)=>{
        try {
            const schema = {
                name: Joi.string().min(3).max(50).required(),
                 email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
                 phone: Joi.string().length(10).regex(/^[0-9]+$/).required()
              };
              return Joi.validate(userObj, schema);
        } catch (e) {
            return e;
        }
    
    },
    validatePassword:async(paasword)=>{
        try{
                return schema.validate(paasword);
        }
        catch(e)
        {
            return e;
        }
    }
    
        
};