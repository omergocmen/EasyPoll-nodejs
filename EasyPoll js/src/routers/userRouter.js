const express=require("express");
const router=express.Router();
const userController=require("../controllers/userControler");
const getAccessToRoute=require("../middleWares/authorizations");
const adminControl=require("../middleWares/adminControl");
const verifyControl=require("../middleWares/verifyControl");
const resetControl=require("../middleWares/resetControl");
const authorizations=require("../middleWares/authorizations");

router.get('/signIn',userController.getSignIn);
router.post('/signIn',userController.postSignIn);


router.get('/logIn',userController.getLogIn);
router.post('/logIn',userController.postLogIn);



router.get('/deleteProfileImage',authorizations,userController.getDeleteProfileImage);

router.get('/profile',authorizations,userController.getProfilePage);
router.post('/profile',authorizations,userController.postProfilePage);


router.get('/verify',verifyControl,userController.getVerify);

router.get('/polls',authorizations,userController.getPolls);
router.post('/polls',authorizations,userController.postSearchPolls);

router.get('/reset',resetControl,userController.getResetPassword);
router.post('/reset',userController.postResetPassword); 


router.get('/forgetPassword',userController.getForgetPassword);
router.post('/forgetPassword',userController.postForgetPassword);

router.get("/admin",adminControl,userController.getAllUsers);

router.get('/',adminControl,userController.getAllUsers);
router.get('/:id',adminControl,userController.getUser);





module.exports=router;