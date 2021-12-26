const mongoose=require("mongoose");
const express=require("express");
const app=express();
module.exports.connectDatabase=function(){
const dbUrl="mongodb+srv://omer:qweasd@dersicin.q35yy.mongodb.net/EasyPoll?retryWrites=true&w=majority";
mongoose.connect(dbUrl)
.then(result=>{
    console.log("Connection Success...")
}
).catch(err=>console.log(err));
}