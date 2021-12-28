const mongoose=require("mongoose");
const express=require("express");
const app=express();
module.exports.connectDatabase=function(){
const dbUrl="mongodb+srv://berkaybabatas:Easypoll@cluster0.7fpt7.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

mongoose.connect(dbUrl)
.then(result=>{
    console.log("Connection Success...")
}
).catch(err=>console.log(err));
}