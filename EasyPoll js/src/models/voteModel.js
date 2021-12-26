const mongoose=require("mongoose");
const bcrypt=require("bcrypt");
const Schema=mongoose.Schema;
const jwt=require("jsonwebtoken");

const VoteSchema = new Schema({
    voterId : {
        type : String,
        trim:true
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
    }

})



module.exports = mongoose.model("Vote",VoteSchema);