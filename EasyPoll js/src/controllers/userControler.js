const User=require("../models/userModel");
const sendJwtToClient=require("../helpers/tokenHelpers");
const nodemailer=require("nodemailer");
const jwt=require("jsonwebtoken");
const bcrypt=require("bcrypt");
const { findByIdAndUpdate } = require("../models/userModel");
const Poll=require("../models/pollModel");
const vote=require("../models/voteModel");
const mDate=require("../models/dateModel");

module.exports.getAllUsers=async function(req,res)
{
    
    const count=(await User.find({})).length;
    const index=Math.ceil(count/6);
    const pageOptions = {
        page: parseInt(req.query.page) || 0,
        limit: parseInt(req.query.limit) || 6,
        index,
        url:"users"
    }
    User.find()
        .sort({'createdAt':-1})
        .skip(pageOptions.page * pageOptions.limit)
        .limit(pageOptions.limit)
        .exec(function (err, users) {
            if(err) { res.status(500).json(err); return; };
            res.render('users',{users,pageOptions});
        });
}
module.exports.getUser=async function(req,res,next)
{
    try {
        const user=await User.findOne({_id:req.params.id});
        res.render('user',{user});
    } catch (error) {
        next();
    }

}


module.exports.postSignIn=async function(req,res,next)
{
    
    if(req.body.password!=req.body.repeatPassword)
    {
        req.flash('info', 'Kayıt Başarısız! Şifreler uyuşmuyor.');
        req.flash('data',req.body);
        res.redirect("/home/users/signIn");
    }
    else
    {
        try {
            const user=new User(req.body);
            user.isAdmin="false";
            user.isActive=false;
            const isThere=await User.findOne({email:user.email});
            if(isThere)
            {
                if(isThere.isActive==false)
                {  
                   await User.findByIdAndRemove({_id:isThere._id});
                }
            }

            const result=await user.save();
            const token=await user.generateJwtFromUser();
            const url="http://localhost:3000/home/users/verify?id="+token;
            let transporter=await nodemailer.createTransport({
                service:'gmail',
                auth:{
                    user:"nodejsdeneme4@gmail.com",
                    pass:"omer125963"
                }
            });

            await transporter.sendMail({
                from:"Nodejs Uygulaması <info@nodejsuygulama.com",
                to:user.email,
                subject:"Lütfen emailiniz onaylayınız",
                text:"Emailinizin onaylanması için linke tıklayınız  "+url
            },(error,info)=>{
                transporter.close();
            });

            req.flash('info', 'Giriş yapabilmek için '+user.email+' giderek onay linkine tıklayınız.');
            res.redirect("logIn");       
        } catch (error) {
            error=errorControler(error);
            let errorArray=[];
            error.message.replace("User validation failed:","").split(",").forEach(element => {
                errorArray.push(element.split(":")[1]);
            });
           
            req.flash('data',req.body);
            req.flash('info',errorArray);
            res.redirect("/home/users/signIn");
        }
    }
}

module.exports.getSignIn=function(req,res)
{
    if(res.locals.auth=="exit")
        {
            res.render("signIn");
        }
        res.redirect("http://localhost:3000/home");
}


module.exports.postLogIn=async function(req,res,next)
{
        req.body.email=req.body.email.toLowerCase();
        const user=await User.findOne({email: req.body.email});

        if(user)
        {
            if(user.isActive==false)
            { 
                req.flash('info', 'Lütfen emailinizi onaylayınız.');
                req.flash('data',req.body);
                res.redirect("/home/users/logIn");
            }
            else
            {
                 bcrypt.compare(req.body.password, user.password, function(err, result) {
                    if(result)
                    {
                        req.flash('info',user.firstName+" "+user.lastName);
                        sendJwtToClient(user,res);
                    }
                    else
                    {
                        req.flash('data',req.body);
                        req.flash('info', 'Giriş Başarısız! Email ya da şifre hatalı.');
                        res.redirect("/home/users/logIn");
                    }
                })
            }

        }
        else
        {
            req.flash('data',req.body);
            req.flash('info', 'Giriş Başarısız! Email ya da şifre hatalı.');
            res.redirect("/home/users/logIn");
        }

        
}



module.exports.getLogIn=function(req,res)
{
    
    if(req.query.exit=="true")
    {
        res.clearCookie('access_token', {httpOnly: true, path:'/', domain: 'localhost'})
        req.flash("auth","exit");
        res.redirect("http://localhost:3000/home/users/logIn");
    }
    else
    {
        if(res.locals.auth=="exit")
        {
            res.render("logIn");
        }
        res.redirect("http://localhost:3000/home");
    }
    
}

module.exports.getForgetPassword=function(req,res)
{
    
    if(res.locals.auth=="exit")
    {
        res.render("forgetPassword");
    }
    res.redirect("http://localhost:3000/home");
    
}

module.exports.postForgetPassword=async function(req,res)
{
    const user=await User.findOne({email: req.body.email});
    if(user)
    {
        if(user.isActive==false)
        {
            req.flash('info', 'Lütfen onaylanmış bir email giriniz.');
            res.redirect("http://localhost:3000/home/users/forgetPassword");
        }
        else
        {

            const token=await user.generateJwtFromUser();
            const url="http://localhost:3000/home/users/reset?id="+token;
            let transporter=await nodemailer.createTransport({
                service:'gmail',
                auth:{
                    user:"nodejsdeneme4@gmail.com",
                    pass:"omer125963"
                }
            });

            await transporter.sendMail({
                from:"EasyPoll Anket Uygulaması <info@nodejsuygulama.com",
                to:user.email,
                subject:"Şifre yenileme linkiniz.",
                text:"Şifrenizi yenilemek için linke tıklayınız  "+url
            },(error,info)=>{
                transporter.close();
            });
            req.flash('info', 'Emailinize bir yenileme uzantısı gönderildi.');
            res.redirect("http://localhost:3000/home/users/forgetPassword");
        }
    }
    else
    {
        req.flash('info', 'Böyle bir email bulunmamaktadır.');
        res.redirect("http://localhost:3000/home/users/forgetPassword");
    }
    
}

module.exports.getVerify=function(req,res)
{
    req.flash('info', 'Email onaylandı giriş yapmayı deneyiniz.');
    res.redirect("login");
}



module.exports.getResetPassword=function(req,res)
{
    if(res.locals.auth=="exit")
        {
            res.render("resetPassword");
        }
        res.redirect("http://localhost:3000/home");
}

module.exports.postResetPassword=async function(req,res)
{
    if(req.body.password==req.body.repeatPassword)
    {
        if(req.body.password.length>=6)
        {
            const {JWT_SECRET_KEY}=process.env;
            try {
                const decodedToken=await jwt.verify(req.query.id,JWT_SECRET_KEY);
                const user=await User.findOne({_id:decodedToken.id});
                user.password=req.body.password;
                const result=await user.save();
                req.flash('info', 'Şifre başarıyla değiştirildi');
                res.redirect("http://localhost:3000/home/users/logIn");
            } catch (error) {
                req.flash('info', 'İşlem yürütülemedi.');
                res.redirect("http://localhost:3000/home/users"+req.url);
            }
        }
        else
        {
            req.flash('info', 'Şifre en az 6 karekterden oluşmalıdır.');
            res.redirect("http://localhost:3000/home/users"+req.url);
        }

    }
    else
    {
        req.flash('info', 'Şifreler uyuşmuyor lütfen tekrar deneyiniz.');
        res.redirect("http://localhost:3000/home/users"+req.url);
    }
}


function errorControler(error) {
    if(error.code===11000)
    {
        error.message=("User validation failed:Email:"+error.keyValue.email+" benzersiz olmalıdır.");
        return error;
    }
    return error;
}

module.exports.getProfilePage=async function(req,res,next)
{
    const user=await User.findById(req.tokenUi);
    res.render("profile",{user});
}

module.exports.postProfilePage=async function(req,res,next)
{
    if(req.body.password===undefined)
    {
        const result =await User.findByIdAndUpdate(req.tokenUi,{firstName:req.body.firstName,lastName:req.body.lastName,business:req.body.business})
        req.flash('info',"Başarıyla güncellendi");
        res.redirect("http://localhost:3000/home/users/profile");
    }
    else
    {
        
        const user=await User.findById(req.tokenUi);
        bcrypt.compare(req.body.password, user.password, function(err, result) {
            if(result)
            {
                if(req.body.email===undefined)
                {
                    if(req.body.newPassword==req.body.repeatPassword && req.body.newPassword.length>=6)
                    {
                        try {
                            user.password=req.body.newPassword;
                            user.save();
                            req.flash('info', 'success:Şifre başarıyla değiştirildi.');
                            res.redirect("http://localhost:3000/home/users/profile");
                        } catch (error) {
                            req.flash('info', 'danger:Hata oluştu.');
                            res.redirect("http://localhost:3000/home/users/profile");
                        }
                    }
                    else
                    {
                        req.flash('info', 'danger:Yeni şifre en az 6 haneden oluşmalıdır ve tekrar ile aynı olmalıdır.');
                        res.redirect("http://localhost:3000/home/users/profile");
                    }
                }
                else
                {
                    try {
                        user.email=req.body.email
                        user.save();
                        req.flash('info', 'success:Email başarıyla değiştirildi.');
                        res.redirect("http://localhost:3000/home/users/profile");
                    } catch (error) {
                        if(error)
                        {
                            console.log(error.message);
                        }
                        req.flash('info', 'danger:Email formatında yazılmalıdır.');
                        res.redirect("http://localhost:3000/home/users/profile");
                    }
                }
            }
            else
            {
                
                req.flash('info', 'danger:Şifre hatalı işlem yapılamaz.');
                res.redirect("http://localhost:3000/home/users/profile");
            }
        })
        
    }
    

}


module.exports.getPolls=async function(req,res,next)
{
    const user=await User.findById(req.tokenUi);

    if(req.query.search!="" && req.query.search!=undefined)
    {
        let value=req.query.search;
        const count=await Poll.find({
            $or: [
            { title: { $regex: '.*' + value + '.*' , $options: 'i' }},
            { isActive: { $regex: '.*' + value + '.*' , $options: 'i' } },
            { description: { $regex: '.*' + value + '.*' , $options: 'i' } },
            { ownerId: req.tokenUi }
          ]
        });
        const index=Math.ceil(count.length/15);
        const pageOptions = {
            page: parseInt(req.query.page) || 0,
            limit: parseInt(req.query.limit) || 15,
            index,
            value,
            url:"users/polls"
        }
        Poll.find({
            $or: [
            { title: { $regex: '.*' + value + '.*' , $options: 'i' }},
            { isActive: { $regex: '.*' + value + '.*' , $options: 'i' } },
            { description: { $regex: '.*' + value + '.*' , $options: 'i' } },
            { ownerId: req.tokenUi }
             ]
            })
            .sort({'createdAt':-1})
            .skip(pageOptions.page * pageOptions.limit)
            .limit(pageOptions.limit)
            .exec(function (err, polls) {
                if(err) { res.status(500).json(err); return; };
                res.render('polls',{polls,user,pageOptions});
            });

    }
    else
    {
        const count=(await Poll.find({ownerId:req.tokenUi})).length;
        const index=Math.ceil(count/15);
        const pageOptions = {
            page: parseInt(req.query.page) || 0,
            limit: parseInt(req.query.limit) || 15,
            index,
            url:"users/polls"
        }
        Poll.find({ownerId:req.tokenUi})
            .sort({'createdAt':-1})
            .skip(pageOptions.page * pageOptions.limit)
            .limit(pageOptions.limit)
            .exec(function (err, polls) {
                if(err) { res.status(500).json(err); return; };
                res.render('polls',{polls,user,pageOptions});
            });
    }
}


module.exports.postSearchPolls=async function(req,res,next)
{
    res.redirect('/home/users/polls?search='+req.body.search);
}