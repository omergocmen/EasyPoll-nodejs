const jwt=require("jsonwebtoken");
const { find } = require("../models/pollModel");
const Poll=require("../models/pollModel");
const pollManagerControl=async (req,res,next)=>{
    const {JWT_SECRET_KEY}=process.env;
    try {
        const decodedToken=await jwt.verify(res.cookie().req.cookies.access_token,JWT_SECRET_KEY);
        const poll=await Poll.find({_id:req.params.id});
        if(decodedToken.id==poll[0].ownerId)
        {
            next()
        }
        else
        {
            res.status(400).json({
                message:"Bu sayfaya erişmeye yetkiniz yoktur."
            })
        }
    } catch (error) {
        res.status(400).json({
            message:"Bu sayfaya erişmeye yetkiniz yoktur."
        })
    }
    
};
module.exports=pollManagerControl;