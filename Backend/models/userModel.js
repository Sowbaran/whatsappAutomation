const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        default: 'Admin'
    },
    email:{
        type:String,
        required:[true,"email must be entered"]
    },
    password:{
        type:String,
        required:[true,"password must be entered"]
    },
    role: {
        type: String,
        enum: ['admin', 'salesman'],
        default: 'admin'
    }
},{
    timestamps:true
})


module.exports = mongoose.model("User",userSchema)