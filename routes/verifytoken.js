
//import  Jwt  from "jsonwebtoken";
const Jwt=require('jsonwebtoken');


function verify(req, res,next){
    const authHeader=req.headers.token;
    if(authHeader){
        const token=authHeader.split(" ")[1];
        Jwt.verify(token,process.env.JWT_SEC,(err,user)=>{
            if(err) res.status(403).json("Token is not valid!");
            req.user=user;
            next();
        })
    }
    else{
        return res.status(401).json("You are not authenticated!");
    }
}
module.exports=verify;
// export default verify;