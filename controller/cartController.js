import productModel from "../models/productModel.js";
import userModel from "../models/userModel.js";

const addToCart = async (req, res) => {
  console.log(req.body)
  try {
    const { userId, productId, quantity } = req.body;

    if (!userId || !productId || !quantity) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const existingQuantity = user.cartData[productId] || 0;
    user.cartData[productId] = existingQuantity + quantity;

    user.markModified('cartData');

    await user.save();

    res.status(200).json({ success: true, message: "Item added to cart", cartData: user.cartData });

  } catch (error) {
    console.log("Error while adding to cart: ", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCartDetails = async (req, res) => {
  console.log(req.body);
  try {
    const { userId } = req.params;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const cartData = user.cartData;

    // Get product IDs from cartData keys
    const productIds = Object.keys(cartData);
    const products = await productModel.find({ _id: { $in: productIds } });

    // Map product details with quantity
    const cartDetails = products.map((product) => ({
      product: product.toObject(),  // convert Mongoose doc to plain JS obj
      quantity: cartData[product._id.toString()] || 0,
    }));

    res.status(200).json({ success: true, cart: cartDetails });
  } catch (error) {
    console.error("Error getting cart details:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const user = await userModel.findById(userId);
    console.log(user)
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.cartData && user.cartData[productId]) {
      delete user.cartData[productId]; // Remove from cart
      user.markModified('cartData');   // Let Mongoose know we modified a mixed type
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Product removed from cart",
        cartData: user.cartData,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

  } catch (error) {
    console.error("Error Removing cart details:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export {
  addToCart, getCartDetails, removeFromCart
};
