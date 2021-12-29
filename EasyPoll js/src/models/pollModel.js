const mongoose=require("mongoose");
const bcrypt=require("bcrypt");
const Schema=mongoose.Schema;
const jwt=require("jsonwebtoken");

const PollSchema = new Schema({
    ownerId : {
        type : String,
        trim:true
    },
    title : {
        type : String,
        required:[true,"Başlık boş geçilemez."],
        trim:true
    },
    description : {
        type : String,
        default : "Açıklama yok.",
        trim:true
    },
    location : {
        type : String
        // ,required:[true,"Meslek veya faaliyet bilgisini girmek zorunludur."]
    },
    isActive : {
        type : Boolean
        // ,required:[true,"Meslek veya faaliyet bilgisini girmek zorunludur."]
    }
    ,
    createdAt : {
        type : Date,
        default : Date.now
    },
    pollImage : {
        type : String,
        default : "defaultPoll.jpg"
    },
    totelVote:{
        type:String,
        default:"0"
    }

})



module.exports = mongoose.model("Poll",PollSchema);