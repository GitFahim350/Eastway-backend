const router = require("express").Router();
const Order = require("../models/order");
const verify = require('./verifytoken');

//CREATE
router.post("/", verify, async (req, res) => {
  const newOrder = new Order(req.body);
  try {
    const savedOrder = await newOrder.save();
    res.status(200).json(savedOrder);
  } catch (err) {
    res.status(500).json(err);
  }
});

//UPDATE
router.put("/:id", verify, async (req, res) => {
  if(req.user.isadmin){
    try {
      const updatedOrder = await Order.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      res.status(200).json(updatedOrder);
    } catch (err) {
      res.status(500).json(err);
    }
  }else{
    res.status(400).json("You are not allowed to update the order");
  }
});

//DELETE
router.delete("/:id", verify, async (req, res) => {
  if(req.user.isadmin){
    try {
      await Order.findByIdAndDelete(req.params.id);
      res.status(200).json("Order has been deleted...");
    } catch (err) {
      res.status(500).json(err);
    }
  }
  else{
    res.status(400).json("You are not allowed to delete the order");
  }
  
});

//GET USER ORDERS
router.get("/find/:userId", verify, async (req, res) => {
  if(req.user.isadmin||req.user.id===req.params.id){
    try {
      const orders = await Order.find({ userId: req.params.userId });
      res.status(200).json(orders);
    } catch (err) {
      res.status(500).json(err);
    }
  }
  else{
    res.status(400).json("You are not allowed");
  }
});


// //GET ALL

router.get("/", verify, async (req, res) => {
  if (req.user.isadmin) {
    try {
      const orders = await Order.find();
      res.status(200).json(orders);
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(400).json("You are no allowed");
  }

});

// GET MONTHLY INCOME

router.get("/income", verify, async (req, res) => {

  if (req.user.isadmin) {
    const date = new Date();
    const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
    const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

    try {
      const income = await Order.aggregate([
        { $match: { createdAt: { $gte: previousMonth } } },
        {
          $project: {
            month: { $month: "$createdAt" },
            sales: "$amount",
          },
        },
        {
          $group: {
            _id: "$month",
            total: { $sum: "$sales" },
          },
        },
      ]);
      res.status(200).json(income);
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
      res.status(400).json("You are  not allowed")
  }

});

module.exports = router;