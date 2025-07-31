const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectToDatabase = require("./database/db");
const cloudinary = require("cloudinary").v2;
const acceptMultimedia = require("connect-multiparty");


const app = express();
app.use(express.json());
dotenv.config();

app.use(acceptMultimedia())

connectToDatabase();

const corsOptions = {
    origin: true,
    credentials: true,
    optionSuccessStatus: 200
};

app.use(cors(corsOptions));

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

app.use("/api", require("./routes/userRoute"))
app.use("/api", require("./routes/productRoutes"))
app.use("/api/cart", require("./routes/cartRoutes"))

app.get('/', (req, res) => {
    res.send("Hello from the server");
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});