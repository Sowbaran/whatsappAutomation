const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:[true,"email must be entered"]
    },
    password:{
        type:String,
        required:[true,"password must be entered"]
    }
},{
    timestamps:true
})


module.exports = mongoose.model("User",userSchema)