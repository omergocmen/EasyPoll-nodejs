const Poll=require("../models/pollModel");
const sendJwtToClient=require("../helpers/tokenHelpers");
const nodemailer=require("nodemailer");
const jwt=require("jsonwebtoken");
const bcrypt=require("bcrypt")
const mDate=require("../models/dateModel");
const Vote=require("../models/voteModel");


module.exports.getCreatePoll=async function(req,res,next)
{
    res.render("createPoll");
}

module.exports.postCreatePoll=async function(req,res,next)
{   

    try {
        
        const poll=new Poll(req.body);
        poll.ownerId="61c783d425e6b0a01351d4d4";
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
    try {
        
        for (let index = 0; index <req.body.date.length; index++) {
            const date=await new mDate({
                pollId:req.params.id,
                date:req.body.date[index],
                beginTime:req.body.beginTime[index],
                endTime:req.body.endTime[index]
            })
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
        const votes=await Vote.find({});
        res.render("votePage",{dates,votes});
    } catch (error) {
        res.send("Bir hata oluştu...");
    }
}


module.exports.postVotePage=async function(req,res,next)
{
    const dates=await mDate.find({pollId:req.params.id})
    dates.forEach(async element => {
        const vote=new Vote({
            dateId:element._id,
            voterId:"61c783d425e6b0a01351d4d4",
            vote:req.body.votes.includes(element.date)
        })
        const result=await vote.save();
    });
    res.redirect("http://localhost:3000/home/createPoll/date/"+req.params.id);
}

