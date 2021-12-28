const jwt=require("jsonwebtoken");
const User=require("../models/userModel");

const enteredControl=async (req,res,next)=>{
    const {JWT_SECRET_KEY}=process.env;
    try {
        const decodedToken=jwt.verify(res.cookie().req.cookies.access_token,JWT_SECRET_KEY);
        const user=await User.find({_id:decodedToken.id});
        req.flash("name",user[0].firstName+" "+user[0].lastName);
        req.flash('auth', 'enter');
        res.locals.auth=req.flash('auth')[0];
        res.locals.name=req.flash('name')[0];
        req.tokenUi=decodedToken.id
        next()

    } catch (error) {
        req.flash('auth', 'exit');
        res.locals.auth=req.flash('auth')[0];
        next();
    }
    
};
module.exports=enteredControl;