const express=require('express');
const app=express();
const mongoose=require('mongoose');
const dotenv=require('dotenv');
const userRoute=require('./routes/user')
const productRoute=require('./routes/product')
const orderRoute=require('./routes/order')
const cartRoute=require('./routes/cart')
const cors=require('cors');
const bodyparser=require('body-parser');
dotenv.config();
mongoose.connect(process.env.Mongo_URL)
.then(()=>
{console.log("Database connection successful")})
.catch((err)=>
console.log(err));

app.use(cors());

app.use(express.json());
app.use("/api/user",userRoute);
app.use("/api/product",productRoute);
app.use("/api/order",orderRoute);
app.use("/api/cart",cartRoute);




app.listen(process.env.PORT||5000,()=>{
    console.log("Exprees is connected at",process.env.PORT)
})