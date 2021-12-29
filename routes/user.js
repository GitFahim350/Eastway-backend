const router=require('express').Router();
const verify=require('./verifytoken');
const CryptoJS=require('crypto-js');
const User=require('../models/user.js');
const dotenv=require('dotenv');
const jwt=require('jsonwebtoken');

dotenv.config();

// New User Registration
router.post('/register',(req,res)=>{
    const newuser=new User({
        username:req.body.username,
        email:req.body.email,
        password:CryptoJS.AES.encrypt(
            req.body.password,
            process.env.SEC
            ).toString(),
        isadmin:req.body.isadmin
    })
    User.create(newuser,(err,data)=>{
        if(err){
            res.status(500).send(err)
        }
        else{
            res.status(203).send(data)
        }
    })
})
//User Login
router.post('/login',async (req,res)=>{
    try{
        const user=await User.findOne({email:req.body.email});
        !user && res.status(401).json("Wrong password or user name");

        const bytes=CryptoJS.AES.decrypt(user.password, process.env.SEC);
        var originalpassword = bytes.toString(CryptoJS.enc.Utf8);

        originalpassword!=req.body.password &&
            res.status(401).json("wrong password or username!");
        const accessToken=jwt.sign(
            {id:user._id,isadmin:user.isadmin},
            process.env.JWT_SEC,
            {expiresIn: "5d"}
        );
        const {password,...info}=user._doc;
            res.status(200).json({...info,accessToken});
    }
    catch(err)
    {
        res.status(500).json(err);
    }
    
})
//user update
router.put("/:id",verify, async (req,res)=>{
    if(req.user.id===req.params.id || req.user.isadmin){
        if(req.body.password){
            req.body.password=CryptoJS.AES.encrypt(
                req.body.password,
                process.env.SEC
                ).toString();
        }
        try{
            const updatuser= await User.findByIdAndUpdate(req.params.id,{
                $set: req.body,
            },{new:true});
            res.status(200).json(updatuser);
        }
        catch(err){
            res.status(500).json(err);
        }
        
    }
    else{
        res.status(403).json("You can update only your account!");
    }
})
//user delete
router.delete("/:id",verify, async (req,res)=>{

    if(req.user.id===req.params.id || req.user.isadmin){
        try{
            await User.findByIdAndDelete(req.params.id);
            res.status(200).json(`User has been deleted...${req.user.isadmin}`);
        }
        catch(err){
            res.status(500).json(err);
        }
    }
    else{
        res.status(403).json("You can delete only your account!");
    }
})
//User get
router.get("/find/:id", async (req,res)=>{
    
    try{
        const user=await User.findById(req.params.id);
        const {password,...info}=user._doc;
        res.status(200).json(info);
    }
    catch(err){
        res.status(500).json(err);
    }
})
//User getall users
router.get("/getall",verify, async (req,res)=>{
    const query=req.query.new;
    
    if(req.user.isadmin){
        try{
            const users=query? await User.find().sort({_id:-1}).limit(2): await User.find();
            res.status(200).json(users);
        }
        catch(err){
            res.status(500).json(err);
        }
    }
    else{
        res.status(403).json("you are not allowed to see all the users!")       
    }
});


//GET USER STATS

router.get("/stats", verify, async (req, res) => {
    const date = new Date();
    const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));
    if(req.user.isadmin){
        try {
            const data = await User.aggregate([
              { $match: { createdAt: { $gte: lastYear } } },
              {
                $project: {
                  month: { $month: "$createdAt" },
                },
              },
              {
                $group: {
                  _id: "$month",
                  total: { $sum: 1 },
                },
              },
            ]);
            res.status(200).json(data)
          } catch (err) {
            res.status(500).json(err);
          }
    }
    else{
        res.status(400).json("You are not allowed to do that");
    }  
});







module.exports=router