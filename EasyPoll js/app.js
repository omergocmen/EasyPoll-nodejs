const express=require("express");
const path=require("path");
const ejs=require("ejs");
const dotenv=require("dotenv");
const errorC=require("./src/helpers/errorC");
const ejsLayouts=require("express-ejs-layouts");
const homeRouter=require("./src/routers/homeRouter");
const dbConnection=require("./src/helpers/dbConnection");
const bodyParser = require('body-parser')
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');






dbConnection.connectDatabase();
const app=express();
app.use(express.json());



dotenv.config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));
app.use(ejsLayouts);
app.set('view engine','ejs');
app.set('views',path.resolve(__dirname,'./src/views'));

app.use(cookieParser('secret'));

app.use(session({
    secret:"secret-key",
    cookie:{maxAge:60000},
    resave:true,
    saveUninitialized:true
}))




app.use(flash());



app.use((req,res,next)=>{
    res.locals.data=req.flash('data')[0];
    res.locals.message=req.flash('info'); 
    res.locals.auth="";
    next();
})



app.use('/home',homeRouter);
app.use('',(req,res)=>{
    res.send("404 not found");
});



app.listen(3000,()=>{
    console.log("Server "+3000+" portunda ayaklandı http://localhost:3000/home");
})