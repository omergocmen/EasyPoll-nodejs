const jwt=require("jsonwebtoken");
const User=require("../models/userModel");
const verifyControl=async (req,res,next)=>{
    const {JWT_SECRET_KEY}=process.env;

        try {
            const decodedToken=await jwt.verify(req.query.id,JWT_SECRET_KEY);
            const user=await User.findOne({_id:decodedToken.id});
            console.log(user.isActive);
            if(user.isActive)
            {
                res.json({
                    message:"Bu link daha önce kullanılmış ya da kullanım dışı kalmıştır."
                })
            }
            await User.findByIdAndUpdate(decodedToken.id,{isActive:true});
            next();
        } catch (error) {
            res.json({
                message:"Böyle bir onay linki bulunmamaktadır ya da süresi geçmiştir"
            })
        }   
    
};
module.exports=verifyControl;