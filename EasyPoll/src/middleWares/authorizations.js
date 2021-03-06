const jwt=require("jsonwebtoken");
const getAccessToRoute=(req,res,next)=>{

    const {JWT_SECRET_KEY}=process.env;
    try {
        const decodedToken=jwt.verify(res.cookie().req.cookies.access_token,JWT_SECRET_KEY);
        next()

    } catch (error) {
        req.flash('info', 'Oturum sonlandı veya zaman aşımına uğradı lütfen giriş yapınız.');
        res.redirect("http://localhost:3000/home/users/logIn");
    }
    
};
module.exports=getAccessToRoute;

