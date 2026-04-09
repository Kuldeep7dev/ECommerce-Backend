var express = require("express");
const Products = require("../Model/Products");
var router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { q } = req.query;
    const { type } = req.query;
    let query = {};

    if (q) {
      query.productName = { $regex: q, $options: "i" };
    }

    if (type) {
      query.category = type;
    }

    const getData = await Products.find(query);
    res.status(200).json({
      message: "Successful",
      product: getData,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error in sample get",
    });
    console.log(error);
  }
});

router.get("/get-count", async (req, res) => {
  try {
    const data = await Products.countDocuments();
    res.status(200).json({
      message: "Successful",
      product: data,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error in products count",
    });
    console.log(error);
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const getproduct = await Products.findOne({ slug });
    res.status(200).json({
      message: "Successfull",
      product: getproduct,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error in sample get id",
      error,
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const data = req.body;
    const postData = await Products.create(data);

    if (!postData) {
      return res.status(404).json({
        message: "Product not found",
      });
    }
    res.status(201).json({
      message: "Successfull",
      product: postData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error in sample post",
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("there is error: ", id);

    const deleteRes = await Products.findByIdAndDelete(id);

    if (!deleteRes) {
      return res.status(404).json({
        message: "Product not found",
      });
    }
    res.status(200).json({
      message: "Successful",
      product: deleteRes,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error",
    });
    console.log(error);

  }
});

router.put("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    const updateRes = await Products.findOneAndUpdate(
      { slug: slug },
      req.body,
      { new: true },
    );

    if (!updateRes) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      message: "Successful",
      product: updateRes,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error",
    });
  }
});

module.exports = router;
