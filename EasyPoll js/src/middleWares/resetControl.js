const jwt=require("jsonwebtoken");
const User=require("../models/userModel");
const verifyControl=async (req,res,next)=>{
    const {JWT_SECRET_KEY}=process.env;

        try {
            const decodedToken=await jwt.verify(req.query.id,JWT_SECRET_KEY);
            const user=await User.findOne({_id:decodedToken.id});
            next();
        } catch (error) {
            res.json({message:"Bu link kullanım dışıdır ya da zaman aşımına uğramıştır."})
        }   
    
};
module.exports=verifyControl;