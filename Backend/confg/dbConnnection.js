const mongoose = require("mongoose");

require("dotenv").config();


const connection = async(req,res) =>{
    try{
    const conn  = await mongoose.connect(process.env.MONGODB)
    console.log("MOngodb is connected succcessfully")
    return conn;

    }catch(err){
        console.log(err);
        process.exit(1)
    }
}

module.exports = connection;
