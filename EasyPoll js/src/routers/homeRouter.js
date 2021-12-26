const express=require("express");
const router=express.Router();
const homeController=require("../controllers/homeController");

const userRouter=require("../routers/userRouter");
const enteredControl=require("../middleWares/enteredControl");

router.get('/',enteredControl,homeController.getAllBlog);

router.use('/users',enteredControl,userRouter);


router.use('/',(req,res)=>{
    res.send("404 not found");
});


module.exports=router;
