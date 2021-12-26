const jwt=require("jsonwebtoken");
const enteredControl=(req,res,next)=>{
    const {JWT_SECRET_KEY}=process.env;
    try {
        const decodedToken=jwt.verify(res.cookie().req.cookies.access_token,JWT_SECRET_KEY);
        req.flash('auth', 'enter');
        res.locals.auth=req.flash('auth')[0];
        next()

    } catch (error) {
        req.flash('auth', 'exit');
        res.locals.auth=req.flash('auth')[0];
        next();
    }
    
};
module.exports=enteredControl;