const mongoose=require("mongoose");
const express=require("express");
const app=express();
module.exports.connectDatabase=function(){

const dbUrl="your mongoDb url";

const {MONGO_URL}=process.env;
console.log(MONGO_URL);

mongoose.connect(dbUrl)
.then(result=>{
    console.log("Connection Success...")
}
).catch(err=>console.log(err));
}