const router = require('express').Router();
const verify = require('./verifytoken');
const Product = require('../models/product.js');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');


dotenv.config();

// New Product creation
router.post('/create/', verify, (req, res) => {
    if (req.user.isadmin) {
        const newproduct = new Product(req.body)
        Product.create(newproduct, (err, data) => {
            if (err) {
                res.status(500).send(err)
            }
            else {
                res.status(203).send(data)
            }
        })
    }
    else{
        res.status(403).json("You can't insert a product");
    }

})

//product update
router.put("/:id/", verify, async (req, res) => {
    if (req.user.isadmin) {
        
        try {
            const updateproduct = await Product.findByIdAndUpdate(req.params.id, {
                $set: req.body,
            }, { new: true });
            res.status(200).json(updateproduct);
        }
        catch (err) {
            res.status(500).json(err);
        }

    }
    else {
        res.status(403).json("You can't update only your account!");
    }
})


//user delete
router.delete("/:id/", verify, async (req, res) => {

    if (req.user.isadmin) {
        try {
            await Product.findByIdAndDelete(req.params.id);
            res.status(200).json(`Product has been deleted...${req.user.isadmin}`);
        }
        catch (err) {
            res.status(500).json(err);
        }
    }
    else {
        res.status(403).json("You can't delete the product!");
    }
})



//User get
router.get("/find/:id/", async (req, res) => {

    try {
        const product = await Product.findById(req.params.id);
        const info = product._doc;
        res.status(200).json(info);
    }
    catch (err) {
        res.status(500).json(err);
    }
})


//User getall products
router.get("/", async (req, res) => {
    const qNew = req.query.new;
    const qCategory=req.query.category;
    try {
        let products;
        if(qNew){
            products=await Product.find().sort({createAt:-1}).limit(5)
        }
        else if(qCategory){
            products=await Product.find({categories:{
                $in:[qCategory],
            },
        });
        }
        else{
            products=await Product.find();
        }
        res.status(200).json(products);
    }
    catch (err) {
        res.status(500).json(err);
    }

});







module.exports = router