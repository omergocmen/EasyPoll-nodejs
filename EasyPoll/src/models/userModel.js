const mongoose=require("mongoose");
const bcrypt=require("bcrypt");
const Schema=mongoose.Schema;
const jwt=require("jsonwebtoken");

const UserSchema = new Schema({

    firstName : {
        type : String,
        required:[true,"Ad alanı boş geçilemez."],
        trim:true
    },
    lastName : {
        type : String,
        required:[true,"Soyad alanı boş geçilemez."],
        trim:true
    },
    biography : {
        type : String
        // ,required:[true,"Meslek veya faaliyet bilgisini girmek zorunludur."]
    },
    isActive : {
        type : Boolean
        // ,required:[true,"Meslek veya faaliyet bilgisini girmek zorunludur."]
    }
    ,
    business : {
        type : String
        // ,required:[true,"Meslek veya faaliyet bilgisini girmek zorunludur."]
    }
    ,
    degree : {
        type : String
        // ,required:[true,"Unvan bilgisini girmek zorunludur."]
    }
    ,
    email : {
        type : String,
        trim:true,
        required: [true,"Email alanı boş geçilemez."],
        lowercase:true,
        unique : true,
        match : [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
        ],
        
    },
    isAdmin : {
        type : Boolean
    },
    password : {
        type : String,
        trim:true,
        minlength : 6,
        required : [true,"Lütfen 6 hane ve üzeri bir Şifre giriniz."]
        // ,select : false
    },
    createdAt : {
        type : Date,
        default : Date.now
    },
    blocked : {
        type : Boolean,
        default : false
    },
    profileImage : {
        type : String,
        default : "default.jpg"
    },
    totelPoll:{
        type:String,
        default:"0"
    }

})

UserSchema.methods.generateJwtFromUser=function(){
    const {JWT_SECRET_KEY,JWT_EXPIRE}=process.env;
    const payload={
        id:this._id,
        firstName:this.firstName,
        lastName:this.lastName,
        isAdmin:this.isAdmin
    }
    const token=jwt.sign(payload,JWT_SECRET_KEY,{
        expiresIn:JWT_EXPIRE
    })
    return token;
};

UserSchema.pre("save",function(next)
{    
    if(!this.isModified("password"))
        {next();}
        bcrypt.genSalt(10, (err, salt)=> {
             if(err) next(err);
             else
             {  
                bcrypt.hash(this.password, salt, (err, hash)=> {
                if(err) next(err)
                this.password=hash;
                next();
            });

             }

    });
    
})

module.exports = mongoose.model("User",UserSchema);