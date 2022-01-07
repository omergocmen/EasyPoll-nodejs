const express=require("express");
const router=express.Router();
const pollController=require("../controllers/pollController");
const getAccessToRoute=require("../middleWares/authorizations");
const adminControl=require("../middleWares/adminControl");
const verifyControl=require("../middleWares/verifyControl");
const resetControl=require("../middleWares/resetControl");
const authorizations=require("../middleWares/authorizations");
const pollManagerControl=require("../middleWares/pollManagerControl");
const updateVotes=require("../middleWares/updateVotes");





router.get('/:id',pollManagerControl,pollController.getCalenderPage);
router.post('/:id',pollManagerControl,pollController.postCalenderPage);



router.get('/',pollController.getCreatePoll);
router.post('/',pollController.postCreatePoll);

router.get('/delete/:id',pollManagerControl,pollController.getDeletePoll);

router.get('/deleteMessage/:id',pollController.getDeleteMessage);

router.get('/updateVote/:id',pollController.getUpdateVote);
router.post('/updateVote/:id',updateVotes,pollController.postUpdateVote);


router.get('/deleteVote/:id',updateVotes,pollController.getDeleteVote);

router.get('/date/:id',pollController.getVotePage);
router.post('/date/:id',pollController.postVotePage);


router.get('/terminate/:id',pollManagerControl,pollController.getTerminate);


router.get('/edit/:id',pollManagerControl,pollController.getEditPoll);
router.post('/edit/:id',pollManagerControl,pollController.postEditPoll);


router.get('/settings/:id',pollManagerControl,pollController.getSettings);
router.post('/settings/:id',pollManagerControl,pollController.postSettings);


module.exports=router;

