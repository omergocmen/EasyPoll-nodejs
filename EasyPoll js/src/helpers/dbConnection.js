const mongoose=require("mongoose");
const express=require("express");
const app=express();
module.exports.connectDatabase=function(){
const dbUrl="mongodb+srv://omer:qweasd@omergocmen.q35yy.mongodb.net/question-answer?retryWrites=true&w=majority";

mongoose.connect(dbUrl)
.then(result=>{
    console.log("Connection Success...")
}
).catch(err=>console.log(err));
}