const express = require("express");
const app = express();
require("dotenv").config()
const port = process.env.PORT || 3000;
const db = require("./confg/dbConnnection")
const userRouter = require("./routes/userRoutes");
const dashRouter = require("./routes/dashboardRoutes");

db();
app.use(express.json())

// app.get("/he",(req,res)=>{
//     res.send("Hello world From the he ")
// })

app.use("/api",userRouter)
app.use("/api",dashRouter)




app.listen(port,()=>{
    console.log(`App is listening at port ${port}`)
})