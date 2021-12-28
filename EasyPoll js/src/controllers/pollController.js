const Poll=require("../models/pollModel");
const sendJwtToClient=require("../helpers/tokenHelpers");
const nodemailer=require("nodemailer");
const jwt=require("jsonwebtoken");
const bcrypt=require("bcrypt")
const mDate=require("../models/dateModel");
const Vote=require("../models/voteModel");
const User=require("../models/userModel");

module.exports.getCreatePoll=async function(req,res,next)
{
    
    res.render("createPoll");
}

module.exports.postCreatePoll=async function(req,res,next)
{       
    try {
        
        const poll=new Poll(req.body);
        poll.ownerId=req.tokenUi;
        const result =await poll.save();
        res.redirect("/home/createPoll/"+result._id);
    } catch (error) {
        let errorArray=[];
            error.message.replace("Poll validation failed:","").split(",").forEach(element => {
                errorArray.push(element.split(":")[1]);
            });
            req.flash('data',req.body);
            req.flash('info',errorArray);
            res.redirect("/home/createPoll");
    }
    
}









module.exports.getCalenderPage=async function(req,res,next)
{
    try {
        const poll=await Poll.findOne({_id:req.params.id});
        res.render("calenderPage");
    } catch (error) {
        next();
    }
}


module.exports.postCalenderPage=async function(req,res,next)
{   

    const result=await mDate.find({pollId:req.params.id});
    result.forEach(async element => {
        const removedElement=await mDate.findByIdAndRemove(element._id);
    });
    const votes=await Vote.find({pollId:req.params.id});
    votes.forEach(async element => {
        const removedElement=await Vote.findByIdAndRemove(element._id);
    });

    try {
        for (let index = 0; index <req.body.date.length; index++) {
            const date=await new mDate({
                pollId:req.params.id,
                date:req.body.date[index],
                beginTime:req.body.beginTime[index],
                endTime:req.body.endTime[index]
            })
            if(date.beginTime==""){date.beginTime="--"}
            if(date.endTime==""){date.endTime="--"}
            const result =await date.save();
        }
        res.redirect("/home/createPoll/date/"+req.params.id);
        
    } catch (error) {
        res.send("İşlem başarısız");
    }
}


module.exports.getVotePage=async function(req,res,next)
{   

    try {
        const poll=await Poll.findOne({_id:req.params.id});
        const dates=await mDate.find({pollId:poll._id});
        const votes=await Vote.find({pollId:req.params.id})
        res.render("votePage",{dates,votes,poll});
    } catch (error) {
        res.send("Bir hata oluştu...");
    }
}

module.exports.postVotePage=async function(req,res,next)
{
    const userr=await User.find({_id:req.tokenUi});
    const vote= await new Vote({
        pollId:req.params.id,
        voterId:userr[0]._id,
        dates:req.body.votes,
        voterFirstName:userr[0].firstName,
        voterLastName:userr[0].lastName
    })
    const result=await vote.save();
    res.redirect("http://localhost:3000/home/createPoll/date/"+req.params.id);
}


module.exports.getEditPoll=async function(req,res,next)
{
    res.render("createPoll")
}

module.exports.postEditPoll=async function(req,res,next)
{   
    
        const result=await Poll.findByIdAndUpdate(req.params.id,{title:req.body.title,description:req.body.description,location:req.body.location});
        const dates=await mDate.find({pollId:req.params.id})
        if(dates.length>0)
        {
            res.redirect("http://localhost:3000/home/createPoll/date/"+req.params.id);
        }
        else
        {
            res.redirect("http://localhost:3000/home/createPoll/"+req.params.id);
        }
    
}

module.exports.getDeletePoll=async function(req,res,next)
{   
    const result=await mDate.find({pollId:req.params.id});
    result.forEach(async element => {
        const removedElement=await mDate.findByIdAndRemove(element._id);
    });
    const votes=await Vote.find({pollId:req.params.id});
    votes.forEach(async element => {
        const removedElement=await Vote.findByIdAndRemove(element._id);
    });
    const rPoll=await Poll.findByIdAndRemove(req.params.id);
    res.redirect("http://localhost:3000/home/createPoll");
}



