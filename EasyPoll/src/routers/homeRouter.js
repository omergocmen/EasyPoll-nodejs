const express=require("express");
const router=express.Router();
const homeController=require("../controllers/homeController");
const pollRouter=require("../routers/pollRouter");
const userRouter=require("../routers/userRouter");
const enteredControl=require("../middleWares/enteredControl");
const authorizations=require("../middleWares/authorizations");


router.get('/',enteredControl,homeController.getAllBlog);
router.use('/createPoll',enteredControl,authorizations,pollRouter);
router.use('/users',enteredControl,userRouter);


module.exports=router;
