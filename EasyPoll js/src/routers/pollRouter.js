const express=require("express");
const router=express.Router();
const pollController=require("../controllers/pollController");
const getAccessToRoute=require("../middleWares/authorizations");
const adminControl=require("../middleWares/adminControl");
const verifyControl=require("../middleWares/verifyControl");
const resetControl=require("../middleWares/resetControl");
const authorizations=require("../middleWares/authorizations");
const pollManagerControl=require("../middleWares/pollManagerControl");



router.get('/:id',pollManagerControl,pollController.getCalenderPage);
router.post('/:id',pollManagerControl,pollController.postCalenderPage);



router.get('/',pollController.getCreatePoll);
router.post('/',pollController.postCreatePoll);

router.get('/delete/:id',pollController.getDeletePoll);

router.get('/date/:id',pollController.getVotePage);
router.post('/date/:id',pollController.postVotePage);

router.get('/edit/:id',pollController.getEditPoll);
router.post('/edit/:id',pollController.postEditPoll);


module.exports=router;

