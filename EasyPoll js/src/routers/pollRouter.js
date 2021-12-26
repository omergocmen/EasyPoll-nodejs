const express=require("express");
const router=express.Router();
const pollController=require("../controllers/pollController");
const getAccessToRoute=require("../middleWares/authorizations");
const adminControl=require("../middleWares/adminControl");
const verifyControl=require("../middleWares/verifyControl");
const resetControl=require("../middleWares/resetControl");



router.get('/:id',pollController.getCalenderPage);
router.post('/:id',pollController.postCalenderPage);



router.get('/',pollController.getCreatePoll);
router.post('/',pollController.postCreatePoll);



router.get('/date/:id',pollController.getVotePage);
router.post('/date/:id',pollController.postVotePage);

module.exports=router;

