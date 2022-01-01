const mongoose=require("mongoose");
const bcrypt=require("bcrypt");
const Schema=mongoose.Schema;
const jwt=require("jsonwebtoken");

const CommentSchema = new Schema({
    pollId : {
        type : String
    },
    ownerId:{
        type:String
    },
    ownerName:{
        type:String
    },
    text:{
        type:String
    },
    createdAt : {
        type : Date,
        default : Date.now
    },
    replies:{
        type:Array
    }
})



module.exports = mongoose.model("comment",CommentSchema);