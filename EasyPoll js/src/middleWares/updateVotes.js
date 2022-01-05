const Vote=require("../models/voteModel");
const mDate=require("../models/dateModel");


const updateVotes=async (req,res,next)=>{
    let vote=await Vote.findById(req.params.id)
    if(req.tokenUi===vote.voterId)
    {
        vote.dates.forEach(async element => {
            const date = await mDate.findById(element)
            date.totel=parseInt(date.totel)-1;
            await date.save(); 
        });
        next();
    }
    else
    {
        res.redirect("http://localhost:3000/home/createPoll/date/"+vote.pollId);
    }

};
module.exports=updateVotes;