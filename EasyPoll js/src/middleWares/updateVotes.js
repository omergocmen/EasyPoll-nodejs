const Vote=require("../models/voteModel");
const mDate=require("../models/dateModel");


const updateVotes=async (req,res,next)=>{
    const vote=await Vote.findById(req.params.id)
    vote.dates.forEach(async element => {
        const date = await mDate.findById(element)
        date.totel=parseInt(date.totel)-1;
        await date.save(); 
    });
    next();
};
module.exports=updateVotes;