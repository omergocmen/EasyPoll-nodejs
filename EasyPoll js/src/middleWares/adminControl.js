const jwt=require("jsonwebtoken");
const adminControl=(req,res,next)=>{
    
    const {JWT_SECRET_KEY}=process.env;
    try {
        const decodedToken=jwt.verify(res.cookie().req.cookies.access_token,JWT_SECRET_KEY);
        console.log(decodedToken);
        if(decodedToken.isAdmin)
        {
            next()
        }
        else
        {
            res.status(400).json({
                message:"Admin sayfasına erişim yetkisine sahip değilsiniz."
            })
        }
        

    } catch (error) {
        res.status(400).json({
            message:"Admin sayfasına erişim yetkisine sahip değilsiniz."
        })
    }
    
};
module.exports=adminControl;