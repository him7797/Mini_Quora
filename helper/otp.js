const authkey="300607AOPlLKzjIw2P5db160cf";
const endpoint="https://control.msg91.com/api/";
const Request=require('request');
const axios=require('axios');

module.exports={
    sendOTP:async (code,phone)=>{
        try{
            let msg ='Use '+code+' as your OTP for Mini Quora. OTP is confidential. Mini Quora will never call you asking for OTP. This OTP will self destruct in 2 Hours.';
            let url = `${endpoint}/sendotp.php?authkey=${authkey}&mobile=${phone}&message=${msg}&sender=MINIQUORA&otp=${code}`;
            const response = await axios.get(url);
            return response.data;
        }
        catch(e){
              return false;
        }
    }
};