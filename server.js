const express = require("express");
const mongoose =  require("mongoose")
const hbs=require("hbs");
const User=require("./model/user");
const nodemailer=require("nodemailer");
const bcrypt = require('bcrypt')
const dotenv=require("dotenv");
dotenv.config();

const app=express();
mongoose.connect("mongodb://localhost:27017/DB");
app.use(express.urlencoded());

var OTP;

const transporter=nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:"riyakhillan19@gmail.com",
        pass:process.env.PASS,
    }
})


app.use=express.urlencoded();

app.set("view engine","hbs");
app.set("views","views");

app.get("/",(req,res)=>{
    res.render("index");
})


app.get("/signup",(req,res)=>{
    res.render("signup");
})

app.post("/signup",async(req,res)=>{
    const {email,password}=req.body;
    if(!email || !password)
    {
        const show=true;
        const message="All feilds are required";
        return res.render("signup",{show,message});
    }
    const existing=await User.findOne({email});
    if(existing)
    {
        const show=true;
        const message="User is already existing";
        return res.render("signup",{show,message});
    }
    const newuser=new User({email,password});
    const hashed = await bcrypt.hash(password,10);
    newuser.password=hashed;
    await newuser.save();
    OTP=generateOTP();
    const verificationlink=`http://localhost:3000/verify?email=${(email)}&otp=${(OTP)}`;
    mail1(email,verificationlink);
    res.render("continuePage",{email});
})

app.get("/resend",(req,res)=>{
    const email = (req.query.email);
    OTP=generateOTP();
    const verificationlink=`http://localhost:3000/verify?email=${(email)}&otp=${(OTP)}`;
    mail1(req.query.email,verificationlink);
    res.render("continuePage",{email});
})

app.get('/verify',async (req,res)=>{
    const {email,otp} = req.query;
    const user = await User.findOne({email});
    if(otp==OTP)
    {
        user.verified=true;
        await user.save();
        return res.render("verifydone",{email});
    }
    else{
        res.render("continuePage");
    }
}) 

app.get('/login',(req,res)=>{
    res.render("login");
})

app.post("/login",async (req,res)=>{
    const {email,password} = req.body;
    const user = await User.findOne({email});
    if(!user)
    {
        const show=true;
        const message = "Invalid Email";
        return res.render("login",{show,message});
    }
    const match = await bcrypt.compare(password,user.password);
    if(!match)
    {
        const show=true;
        const message = "Invalid Email or password";
        return res.render("login",{email,show,message});
    }
    if(!user.verified)
    {
        const show=true;
        const message = "Email is not Verified Please check your mail";
        OTP=generateOTP();
        const verificationlink=`http://localhost:3000/verify?email=${(email)}&otp=${(OTP)}`;
        mail1(email,verificationlink);
        return res.render("login",{email,show,message});
    }
    res.send("Welcome to My Website");
})

function mail1(Email,verificationlink){
    const mail={
        from:"riyakhillan19@gmail.com",
        to:Email,
        subject:"Verify your email",
        html:`
        <h1>Verify your email address</h1>
        <p>To continue setting up your account, please verify that 
        this is your email address</p>
        <a href=${verificationlink}><button>Verify email address</button></a>`,
    }
    transporter.sendMail(mail);
}

function generateOTP() {
    const otpLength = 4;
    let otp = '';
    for (let i = 0; i < otpLength; i++) {
      otp += Math.floor(Math.random() * 10); // Generate a random digit (0-9) and append it to the OTP
    }
    return otp;
  }

app.listen(3000,()=>{
    console.log("http://localhost:3000");
})