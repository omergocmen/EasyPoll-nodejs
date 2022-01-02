const mongoose=require("mongoose");
const bcrypt=require("bcrypt");
const Schema=mongoose.Schema;
const jwt=require("jsonwebtoken");
const mDate=require("./dateModel");

const VoteSchema = new Schema({
    voterId : {
        type : String,
        trim:true
    },
    voterFirstName : {
        type : String,
        trim:true
    },
    voterLastName : {
        type : String,
        trim:true
    },
    pollId:{
        type:String
    },
    dateId:{
        type:String
    },
    vote:{
        type:Boolean
    },
    createdAt : {
        type : Date,
        default : Date.now
    },
    dates:{
        type:Array
    }

})


VoteSchema.pre("save",function(next)
{    
    this.dates.forEach(async element => {
        const date=await mDate.findById(element);
        date.totel=parseInt(date.totel)+1;
        const result =await date.save();
    });
    next();
})



module.exports = mongoose.model("Vote",VoteSchema);