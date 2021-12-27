const mongoose=require('mongoose');
const Productschema=new mongoose.Schema({
    title: {type:String, required:true,unique:true},
    desc: {type:String, required:true,unique:true},
    categories: {type:Array},
    img: {type:String},
    color: {type:Array},
    size: {type:Array},
    price: {type:Number,required:true},
},
{timestamps:true}
);
module.exports=mongoose.model("product",Productschema);

