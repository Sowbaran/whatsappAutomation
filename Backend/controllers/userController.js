const User = require("../models/userModel")
const Salesman = require("../models/salesmanModel");
const jwt =  require("jsonwebtoken")

const user = async(req,res) =>{
    console.log("hello World frm user")
    const {email,password} = req.body;
    let user = await User.findOne({email});
    
    if (user) {
        if(user.password !== password){
            return res.status(401).json({
                message:"Invalid password!"
            })
        }
    } else {
        const salesman = await Salesman.findOne({ email });
        if (!salesman) {
            return res.status(404).json({
                message: "User not found!!"
            });
        }
        if (salesman.password !== password) {
            return res.status(401).json({
                message: "Invalid password!"
            });
        }
        user = { ...salesman.toObject(), role: 'salesman' };
    }

    const payload = {
      id: user._id,
      email: user.email,
      name: user.name || 'Admin',
      role: user.role || "user"
    };

    // Generate token
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: "1h" // token valid for 1 hour
    });
    console.log("USER CONTROLLER: ",token)

    res.cookie('token', token, { httpOnly: true, secure: true });
    if(user.role === 'salesman'){
        return res.json({
            message: "Login successful",
            role: user.role,
            token,
            userId: user._id,
            redirectUrl: "/api/salesmen/orders"
        });
    } else {
        return res.json({
            message: "Login successful",
            role: user.role,

            redirectUrl: "/admin"
        });
    }
}

const logout = (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: "Logout successful" });
};

module.exports = { user, logout };
