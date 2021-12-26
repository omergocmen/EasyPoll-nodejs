const jwt=require("jsonwebtoken");
const getAccessToRoute=(req,res,next)=>{

    const {JWT_SECRET_KEY}=process.env;
    try {
        const decodedToken=jwt.verify(res.cookie().req.cookies.access_token,JWT_SECRET_KEY);
        next()

    } catch (error) {
       
        if(error.name==="TokenExpiredError")
        {
            res.send("Oturumunuzun süresi doldu lütfen tekrar giriş yapmayı deneyiniz.");
        }
        else if(error.name==="JsonWebTokenError")
        {
            res.send("Oturum sonlandı lütfen tekrar giriş yapmayı deneyiniz.");
        }
    }
    
};
module.exports=getAccessToRoute;

