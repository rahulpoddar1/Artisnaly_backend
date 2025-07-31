const Product = require("../models/productModel");
const cloudinary = require("cloudinary");

// Create Product
const createProduct = async (req, res) => {
    try {
        const { title, description, productType, productPrice, discountPrice } = req.body;
        let image = req.files && req.files.image;
        console.log(req.body)
        if (!title || !productPrice || !productType || !discountPrice) {
            return res.status(400).json({
                success: false,
                message: "Required fields missing",
            });
        }

        let uploadedImage = { secure_url: "" };
        if (image && image.path) {
            uploadedImage = await cloudinary.v2.uploader.upload(image.path, {
                folder: "products",
                crop: "scale",
            });
        }

        const product = new Product({
            title,
            description,
            productType,
            productPrice,
            discountPrice,
            image: uploadedImage.secure_url,
        });

        await product.save();
        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            product,
        });
    } catch (error) {
        console.error("Create Product Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

// Get All Products
const getAllProducts = async (req, res) => {

    try {
        const products = await Product.find().sort({ createdAt: -1 });
        console.log(req.body)
        return res.status(200).json({ success: true, products });
    } catch (error) {
        console.error("Fetch Products Error:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Get Single Product
const getProductById = async (req, res) => {
    console.log(req.body)

    try {
        const product = await Product.findById(req.params.id);
        if (!product)
            return res.status(404).json({ success: false, message: "Not found" });

        return res.status(200).json({ success: true, product });
    } catch (error) {
        console.error("Fetch Product Error:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Update Product
const updateProduct = async (req, res) => {
    console.log(req.body)

    try {
        const { title, description, productType, productPrice } = req.body;
        let image = req.files && req.files.image;

        const updatedData = { title, description, productType, productPrice };

        if (image && image.path) {
            const uploadedImage = await cloudinary.v2.uploader.upload(image.path, {
                folder: "products",
                crop: "scale",
            });
            updatedData.image = uploadedImage.secure_url;
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            updatedData,
            { new: true }
        );

        if (!product)
            return res.status(404).json({ success: false, message: "Not found" });

        return res.status(200).json({
            success: true,
            message: "Product updated",
            product,
        });
    } catch (error) {
        console.error("Update Product Error:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Delete Product
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product)
            return res.status(404).json({ success: false, message: "Not found" });

        return res.status(200).json({ success: true, message: "Deleted" });
    } catch (error) {
        console.error("Delete Product Error:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
};
