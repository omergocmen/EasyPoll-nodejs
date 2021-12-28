const mongoose=require("mongoose");
const bcrypt=require("bcrypt");
const Schema=mongoose.Schema;
const jwt=require("jsonwebtoken");

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



module.exports = mongoose.model("Vote",VoteSchema);