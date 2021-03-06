const Poll=require("../models/pollModel");
const sendJwtToClient=require("../helpers/tokenHelpers");
const nodemailer=require("nodemailer");
const jwt=require("jsonwebtoken");
const bcrypt=require("bcrypt")
const mDate=require("../models/dateModel");
const Vote=require("../models/voteModel");
const User=require("../models/userModel");
const qr=require("qrcode");
const Comment=require("../models/commentModel");


const updateVotes=require("../middleWares/updateVotes");

module.exports.getCreatePoll=async function(req,res,next)
{
    res.render("createPoll");
}

module.exports.postCreatePoll=async function(req,res,next)
{       
    try {
        const poll=new Poll(req.body);
        if(poll.description==""){poll.description="Açıklama yok"}
        poll.ownerId=req.tokenUi;
        const result =await poll.save();
        const userr=await User.findById(poll.ownerId);
        userr.totelPoll=parseInt(userr.totelPoll)+1;
        const resultuser=await userr.save();
        poll.activeLink="http://localhost:3000/home/createPoll/settings/"+result.id;
        await poll.save();
        res.redirect("http://localhost:3000/home/createPoll/settings/"+result.id);
    } catch (error) {
        let errorArray=[];
            error.message.replace("Poll validation failed:","").split(",").forEach(element => {
                errorArray.push(element.split(":")[1]);
            });
            req.flash('data',req.body);
            req.flash('info',errorArray);
            res.redirect("/home/createPoll");
    }
    
}









module.exports.getCalenderPage=async function(req,res,next)
{
    try {
        const poll=await Poll.findOne({_id:req.params.id});
        res.render("calenderPage");
    } catch (error) {
        next();
    }
}


module.exports.postCalenderPage=async function(req,res,next)
{   
    
    if(typeof req.body.date=="string")
    {
        req.flash('info',"En az 2 tarih seçilmelidir.");
        res.redirect("/home/createPoll/"+req.params.id);
    }
    else if(!req.body.date)
    {
        req.flash('info',"En az 2 tarih seçilmelidir.");
        res.redirect("/home/createPoll/"+req.params.id);
    }
    else
    {
        const result=await mDate.find({pollId:req.params.id});
        result.forEach(async element => {
        const removedElement=await mDate.findByIdAndRemove(element._id);
        });

        const votes=await Vote.find({pollId:req.params.id});
        votes.forEach(async element => {
        const removedElement=await Vote.findByIdAndRemove(element._id);
        });

        try {
        for (let index = 0; index <req.body.date.length; index++) {
            const date=await new mDate({
                pollId:req.params.id,
                date:req.body.date[index],
                beginTime:req.body.beginTime[index],
                endTime:req.body.endTime[index]
            })
            if(date.beginTime==""){date.beginTime="--"}
            if(date.endTime==""){date.endTime="--"}
            const result =await date.save();
        }
        const poll=await Poll.findById(req.params.id);
        poll.activeLink="http://localhost:3000/home/createPoll/date/"+req.params.id;
        poll.isActive="Şuan Aktif."
        await poll.save();
        res.redirect("/home/createPoll/date/"+req.params.id);
        
    } catch (error) {
        res.render("errPage");
    }
    }
}


module.exports.getVotePage=async function(req,res,next)
{   
    let votes;
    let voteId=false
    let poll=await Poll.findOne({_id:req.params.id});
        try {
            const dates=await mDate.find({pollId:poll._id});
            if(req.query.mode!=undefined && req.query.mode==="true" && req.tokenUi===poll.ownerId)
            {
                poll.mode="true";
                await poll.save();
            }
            else if(req.query.mode!=undefined && req.query.mode==="false" && req.tokenUi===poll.ownerId)
            {
                poll.mode="false";
                await poll.save();
            }
            let manager=false;
            if(req.tokenUi==poll.ownerId)
            {
                manager=true;
            }
            
            if(manager==false && poll.mode=="false")
            {
                 votes=await Vote.find({
                     pollId:req.params.id
                    ,voterId:req.tokenUi
                    })
            }
            else
            {
                 votes=await Vote.find({pollId:req.params.id})
            }
            
            let comments=await Comment.find({pollId:req.params.id})
            qr.toDataURL(poll.activeLink, (err, src) => {
                    if (err) throw err ;
                    res.render("votePage",{dates,votes,poll,manager,comments,src,voteId});
            });
        
        } catch (error) {
            res.render("errPage")
        }

}

module.exports.postVotePage=async function(req,res,next)
{
    
    if(req.body.setPassword!=undefined)
    {
        let poll=await Poll.findById(req.params.id);
        if(req.body.setPassword=="")
        {
            poll.password="none";
        }
        else
        {
            poll.password=req.body.setPassword;
        }
        await poll.save();
        req.flash("prop","success:Şifreleme işlemi başarıyla gerçekleştirildi şifre ile giriş yapmasını istediğiniz kişiler için şifre ile giriş linki anketi şifrele bölümünde oluşturulmuştur.");
        res.redirect("http://localhost:3000/home/createPoll/date/"+poll.id+"#votes")
    }
    else if(req.body.setDate!=undefined)
    {
        let poll=await Poll.findById(req.params.id);
        if(req.body.setDate)
        {
            poll.endTime=req.body.setDate;
            await poll.save();
        }
        else
        {
            poll.endTime="none"
            await poll.save();
        }

        res.redirect("http://localhost:3000/home/createPoll/date/"+req.params.id+"#votes");
        
    }
    else if(req.body.comment)
    {
        if(req.body.comment[0]=="comment")
        {
            let user=await User.findById(req.tokenUi);
            for (let index = 1; index < req.body.comment.length; index++) {
                const comment=new Comment(
                    {
                    pollId:req.params.id,
                    ownerId:req.tokenUi,
                    ownerName:user.firstName+" "+user.lastName,
                    text:req.body.comment[index],
                    ownerProfile:user.id+""+user.profileImage
                    }
                )
                await comment.save();
                let poll=await Poll.findById(req.params.id);
                if(poll.sendMail=="true" && req.tokenUi!=poll.ownerId)
                {
                    let pollmanager=await User.findById(poll.ownerId);
                    let message=user.firstName+" "+user.lastName+" kullanıcısı "+poll.title+" anketine yorum yaptı hareketliliği görmek için  http://localhost:3000/home/createPoll/date/"+poll.id+"#comment "
                    sendMailToUser(message,pollmanager.email);
                }
            }
            res.redirect("http://localhost:3000/home/createPoll/date/"+req.params.id+"#comment")
        }
        else{
            let user =await User.findById(req.tokenUi);
            let comment=await Comment.findById(req.body.comment[0].trim());
            const reply=
                {
                ownerId:req.tokenUi,
                ownerName:user.firstName +" "+user.lastName,
                text:req.body.comment[1],
                createdAt:new Date(Date.now()),
                ownerProfile:user.id+""+user.profileImage
                }          
            comment.replies.push(reply);
            comment.save();
            res.redirect("http://localhost:3000/home/createPoll/date/"+req.params.id+"#comment")
        }
        

    }
    else if(req.body.mail)
    {
        
        if(typeof req.body.mail==="string")
        {
            req.flash('info',"danger:Lütfen email girdikten sonra gönder tuşuna basınız emaillerin doğru olduğundan emin olunuz.")
            res.redirect("/home/createPoll/date/"+req.params.id+"#sendemail");
        }
        else if (typeof req.body.mail==="object")
        {
            let userr=await User.find({_id:req.tokenUi});
            
            for (let index = 1; index < req.body.mail.length; index++) {
                
                let transporter=await nodemailer.createTransport({
                    service:'gmail',
                    auth:{
                        user:"nodejsdeneme4@gmail.com",
                        pass:"omer125963"
                    }
                });
    
                 transporter.sendMail({
                    from:"EasyPoll Anket Uygulaması <info@nodejsuygulama.com",
                    to:req.body.mail[index],
                    subject:userr[0].firstName+" "+userr[0].lastName+" Tarafından bir ankete davet edildiniz.",
                    text:"Ankete katılmak için http://localhost:3000/home/createPoll/date/"+req.params.id+" linkine tıklayınız"
                },(error,info)=>{
                    transporter.close();
                });
            }
            req.flash('info',"success:Davet linki başarıyla seçtiğiniz emaillere gönderildi.")
            res.redirect("/home/createPoll/date/"+req.params.id+"#sendemail");
        }
    }
    else
    {
        
        const poll=await Poll.findById(req.params.id);
        if(poll.oneVote=="true")
        {
            const votes=await Vote.find({pollId:req.params.id,voterId:req.tokenUi})
            if(votes.length==0)
            {
                const userr=await User.find({_id:req.tokenUi});
                const vote= await new Vote({
                    pollId:req.params.id,
                    voterId:userr[0]._id,
                    dates:req.body.votes,
                    voterFirstName:userr[0].firstName,
                    voterLastName:userr[0].lastName,
                    voterProfile:userr[0].id+""+userr[0].profileImage
                })
        
                poll.totelVote=parseInt(poll.totelVote)+1;
                const resultpoll =await poll.save();
                const result=await vote.save();
                if(poll.sendMail=="true" && req.tokenUi!=resultpoll.ownerId)
                {
                    const pollmanager=await User.findById(poll.ownerId);
                    const message=pollmanager.firstName+" "+pollmanager.lastName+" kullanıcısı "+poll.title+" anketine bir oy kullandı hareketliliği görmek için  http://localhost:3000/home/createPoll/date/"+poll.id+"#votes";
                    sendMailToUser(message,pollmanager.email);
                }
                res.redirect("http://localhost:3000/home/createPoll/date/"+req.params.id+"#votes");
            }
            else
            {
                res.redirect("http://localhost:3000/home/createPoll/date/"+req.params.id+"#votes");
            }

        }
        else
        {
            const userr=await User.find({_id:req.tokenUi});
            const vote= await new Vote({
                pollId:req.params.id,
                voterId:userr[0]._id,
                dates:req.body.votes,
                voterFirstName:userr[0].firstName,
                voterLastName:userr[0].lastName,
                voterProfile:userr[0].id+""+userr[0].profileImage
            })
    
            poll.totelVote=parseInt(poll.totelVote)+1;
            const resultpoll =await poll.save();
            const result=await vote.save();
            if(poll.sendMail=="true" && req.tokenUi!=resultpoll.ownerId)
            {
                const pollmanager=await User.findById(poll.ownerId);
                let message=userr[0].firstName+" "+userr[0].lastName+" kullanıcısı "+poll.title+" anketine bir oy kullandı hareketliliği görmek için  http://localhost:3000/home/createPoll/date/"+resultpoll.id+"#votes";
                sendMailToUser(message,pollmanager.email);
            }
            
            res.redirect("http://localhost:3000/home/createPoll/date/"+req.params.id+"#votes");
        }

    }
    
}


module.exports.getEditPoll=async function(req,res,next)
{
    res.render("createPoll")
}

module.exports.postEditPoll=async function(req,res,next)
{   
        if(req.body.title==""){
            req.flash('info','Başlık boş geçilemez');
            res.redirect("http://localhost:3000/home/createPoll/edit/"+req.params.id)
        }
        else
        {
            const result=await Poll.findByIdAndUpdate(req.params.id,{title:req.body.title,description:req.body.description,location:req.body.location});
            const dates=await mDate.find({pollId:req.params.id})
            if(dates.length>0)
            {
                res.redirect("http://localhost:3000/home/createPoll/date/"+req.params.id);
            }
            else
            {
                res.redirect("http://localhost:3000/home/createPoll/"+req.params.id);
            }
        }

    
}

module.exports.getDeletePoll=async function(req,res,next)
{   
    const result=await mDate.find({pollId:req.params.id});
    result.forEach(async element => {
        const removedElement=await mDate.findByIdAndRemove(element._id);
    });
    const votes=await Vote.find({pollId:req.params.id});
    votes.forEach(async element => {
        const removedElement=await Vote.findByIdAndRemove(element._id);
    });
    const rPoll=await Poll.findByIdAndRemove(req.params.id);
    res.redirect("http://localhost:3000/home/createPoll");
}


module.exports.getDeleteMessage=async function(req,res,next)
{   
    const comment=await Comment.findById(req.params.id);
    try {

        if(comment.ownerId===req.tokenUi){
                const result =await Comment.findByIdAndRemove(req.params.id);
                res.redirect("http://localhost:3000/home/createPoll/date/"+result.pollId+"#comment");
        }
        else{
            res.redirect("http://localhost:3000/home/createPoll/date/"+comment.pollId+"#comment")
        }
    } catch (error) {
        res.render("errPage");
    }

}




module.exports.getUpdateVote=async function(req,res,next)
{   
    
    
    let voteId=req.params.id;
    let votes;
    try {
        let vote =await Vote.findById(req.params.id);
        let poll=await Poll.findById(vote.pollId);
        let dates=await mDate.find({pollId:poll._id});
        if(req.query.mode!=undefined && req.query.mode==="true" && req.tokenUi===poll.ownerId)
        {
            poll.mode="true";
            await poll.save();
        }
        else if(req.query.mode!=undefined && req.query.mode==="false" && req.tokenUi===poll.ownerId)
        {
            poll.mode="false";
            await poll.save();
        }
        let manager=false;
        if(req.tokenUi==poll.ownerId)
        {
            manager=true;
        }
        
        if(manager==false && poll.mode=="false")
        {
             votes=await Vote.find({
                 pollId:poll.id
                ,voterId:req.tokenUi
                })
        }
        else
        {
             votes=await Vote.find({pollId:poll.id})
        }
        
        let comments=await Comment.find({pollId:poll.id})
        qr.toDataURL(poll.activeLink, (err, src) => {
                if (err) throw err ;
                res.render("votePage",{dates,votes,poll,manager,comments,src,voteId});
        });
        
    } catch (error) {
        res.render("errPage");
    }
}

module.exports.postUpdateVote=async function(req,res,next)
{   
    
    let vote =await Vote.findById(req.params.id);
    let poll=await Poll.findById(vote.pollId);

    if(req.body.votes)
    {
        if(typeof req.body.votes==="string")
        {
            vote.dates= [req.body.votes];
            await vote.save();
            res.redirect("http://localhost:3000/home/createPoll/date/"+poll.id+"#tb")   
        }
        else if (typeof req.body.votes==="object")
        {
            vote.dates=req.body.votes;
            await vote.save();
            res.redirect("http://localhost:3000/home/createPoll/date/"+poll.id+"#tb")
        }
    }
    else
    {
        vote.dates=[];
        await vote.save();
        res.redirect("http://localhost:3000/home/createPoll/date/"+poll.id+"#tb")
    }

    

}


module.exports.getDeleteVote=async function(req,res,next){
    const result=await Vote.findByIdAndRemove(req.params.id);  
    const poll=await Poll.findById(result.pollId);
    poll.totelVote=parseInt(poll.totelVote)-1;
    res.redirect("http://localhost:3000/home/createPoll/date/"+poll.id);
}


module.exports.getSettings=async function(req,res,next)
{
    let poll=await Poll.findById(req.params.id);
    if(poll.activeLink=="http://localhost:3000/home/createPoll/settings/"+req.params.id)
    {
        res.render("settings");
    }
    else
    {
        res.redirect(poll.activeLink);
    }
    
}


module.exports.postSettings=async function(req,res,next)
{

    let poll=await Poll.findById(req.params.id);
    if(typeof req.body.set=="string" )
    {
        if(req.body.set!="")
        {
            poll.endTime=req.body.set;
            await poll.save();
        }

    }
    else
    {

        if(req.body.set.includes('oneVote'))
        {
            poll.oneVote="true"
            await poll.save();
        }
        else
        {
            poll.oneVote="false"
            await poll.save();
        }


        if(req.body.set.includes('mail'))
        {
            poll.sendMail="true"
            await poll.save();
        }
        else
        {
            poll.sendMail="false"
            await poll.save();
        }
        
        if(req.body.set.includes('oneDate')){
            poll.oneDate="true"
            await poll.save();
        }
        else{
            poll.oneDate="false"
            await poll.save();
        }
        if(req.body.set[req.body.set.length-1]!="")
        {
            poll.endTime=req.body.set[req.body.set.length-1]
            await poll.save();
        }
    }
    poll.activeLink="http://localhost:3000/home/createPoll/"+req.params.id;
    await poll.save();
    res.redirect("http://localhost:3000/home/createPoll/"+req.params.id);
    
}

 function sendMailToUser(message,email) {
    let transporter= nodemailer.createTransport({
        service:'gmail',
        auth:{
            user:"nodejsdeneme4@gmail.com",
            pass:"omer125963"
        }
    });

     transporter.sendMail({
        from:"EasyPoll Anket Uygulaması <info@nodejsuygulama.com",
        to:email,
        subject:"Anket hakkında hareketlilik",
        text:message
    },(error,info)=>{
        transporter.close();
    });

}
module.exports.getTerminate=async function(req,res,next)
{
    let poll=await Poll.findById(req.params.id);
    poll.isActive="Anket Oylamaya Kapatıldı."
    poll.endTime="none"
    await poll.save();
    res.redirect("http://localhost:3000/home/createPoll/date/"+req.params.id)
    
}


module.exports.getPollPassword=async function(req,res,next)
{
        res.render("pollPassword");
}

module.exports.postPollPassword=async function(req,res,next)
{

    let poll =await Poll.findById(req.params.id);
    if(req.body.password==poll.password)
    {
        req.flash('prop','success:Ankete Hoşgeldiniz.')
        res.redirect("http://localhost:3000/home/createPoll/date/"+req.params.id);
    }  
    else
    {
        req.flash('info','danger:Anket şifresi hatalıdır.')
        res.redirect("http://localhost:3000/home/createPoll/pollPassword/"+req.params.id);
    }
}