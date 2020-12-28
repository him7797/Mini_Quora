const Config=require('../config/config');
const authkey=Config.msg91.authkey;
const endpoint=Config.msg91.endpoint;
const axios=require('axios');

module.exports={
    sendOTP:async (code,phone)=>{
        try{
            let msg ='PNR No.:6806585365,TXN ID:100002462777103,Passenger Name:Banarasi Singh,Gender:M,Age:46,Status:CNFS3/42MB,Quota:GENERAL (GN),Train No.:02819,Train Name:BBS ANVT SPL,Date Of Journey:10-Dec-2020,Boarding Station:DD UPADHYAYA JN - DDU,Class:SLEEPER_CLASS (SL),From:DD UPADHYAYA JN - DDU,To:ANAND VIHAR TRM - ANVT,Ticket Fare:i 555.0, IRCTC C Fee:11.8+PG Charges Extra';
            let url = `${endpoint}/sendotp.php?authkey=${authkey}&mobile=${phone}&message=${msg}&sender=IRCTC&otp=${code}`;
            const response = await axios.get(url);
            return response.data;
        }
        catch(e){
              return false;
        }
    }
};