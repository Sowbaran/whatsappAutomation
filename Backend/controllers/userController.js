const User = require("../models/userModel")
const jwt =  require("jsonwebtoken")
const user = async(req,res) =>{
    console.log("hello World frm user")
    const {email,password} = req.body;
    const data = await User.find({email});
    if(!data){
        return res.status(404).json({
            message:"User not found!!"
        })
    }
    const isMatch = data.password;
    if(!isMatch){
          return res.status(404).json({
            message:"User not found!!"
        })
    }

     const payload = {
      id: data._id,
      email: data.email,
      role: data.role || "user"
    };

    // Generate token
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: "1h" // token valid for 1 hour
    });

    return res.json({
      message: "Login successful",
      token
    });


}

module.exports = user;