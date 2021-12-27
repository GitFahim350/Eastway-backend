const router = require("express").Router();
const Cart = require("../models/cart");
const verify = require('./verifytoken');

//CREATE

router.post("/", verify, async (req, res) => {
    const newCart = new Cart(req.body);

    try {
        const savedCart = await newCart.save();
        res.status(200).json(savedCart);
    } catch (err) {
        res.status(500).json(err);
    }
});

//UPDATE
router.put("/:id", verify, async (req, res) => {
    if (req.user.id === req.params.id || req.user.isadmin) {
        try {
            const updatedCart = await Cart.findByIdAndUpdate(
                req.params.id,
                {
                    $set: req.body,
                },
                { new: true }
            );
            res.status(200).json(updatedCart);
        }
        catch (err) {
            res.status(500).json(err);
        }
    }
    else {
        res.status(400).json("you are not allowed")
    }

});

//DELETE
router.delete("/:id", verify, async (req, res) => {
    if (req.user.id === req.params.id || req.user.isadmin) {
        try {
            await Cart.findByIdAndDelete(req.params.id);
            res.status(200).json("Cart has been deleted...");
        } catch (err) {
            res.status(500).json(err);
        }
    }
    else {
        res.status(400).json("You are not allowed");
    }

});

//GET USER CART
router.get("/find/:userId", verify, async (req, res) => {
    if (req.user.id === req.params.id || req.user.isadmin) {
        try {
            const cart = await Cart.findOne({ userId: req.params.userId });
            res.status(200).json(cart);
        } catch (err) {
            res.status(500).json(err);
        }
    }
    else {
        res.status(400).json("You are not allowed");
    }
});

// //GET ALL

router.get("/", verify, async (req, res) => {
    if(req.user.isadmin){
        try {
            const carts = await Cart.find();
            res.status(200).json(carts);
        } 
        catch (err) {
            res.status(500).json(err);
        }
    }
    else{
        res.status(400).json("You are not allowed");
    }
    
});

module.exports = router;
