const mongoose=require("mongoose");
const bcrypt=require("bcrypt");
const Schema=mongoose.Schema;
const jwt=require("jsonwebtoken");

const DateSchema = new Schema({
    pollId : {
        type : String
    },
    dateId : {
        type : String
    },
    date : {
        type : String
    },
    beginTime : {
        type : String
        // ,required:[true,"Meslek veya faaliyet bilgisini girmek zorunludur."]
    },
    endTime : {
        type : String
        // ,required:[true,"Meslek veya faaliyet bilgisini girmek zorunludur."]
    },
    totel:{
        type:String,
        default:"0"
    }
})



module.exports = mongoose.model("date",DateSchema);