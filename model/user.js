const mongoose = require("mongoose");
const schema=mongoose.Schema({
    email:{
        type:String,
    },
    password:{
        type:String,
    },
    verified:{
        type:Boolean,
        default:false
    }
})

const model=mongoose.model("user",schema);
module.exports=model;