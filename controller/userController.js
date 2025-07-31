const User = require("../models/userModel");
const cloudinary = require("cloudinary");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")


const signUp = async (req, res) => {
    console.log(req.body);
    const { firstName, lastName, email, userName, phoneNumber, password } = req.body;
    let image = req.files && req.files.image;

    if (!image) {
        image = { path: '' };
    } else if (!image.path) {
        console.error("Uploaded file does not have 'path' property:", image);
        return res.status(400).json({
            success: false,
            message: "Uploaded file is invalid"
        });
    }

    if (!firstName || !lastName || !email || !userName || !phoneNumber || !password) {
        return res.status(400).json({
            success: false,
            message: "Please enter all fields"
        });
    }
    try {
        let uploadedImage = { secure_url: '' }; 

        if (image.path) {
            uploadedImage = await cloudinary.v2.uploader.upload(
                image.path,
                {
                    folder: "user",
                    crop: "scale"
                });
        }

        const userExist = await User.findOne({ email: email });
        if (userExist) {
            return res.status(400).json({
                success: false,
                message: "User Already Exist"
            });
        }
        const userNameExist = await User.findOne({ userName: userName });
        if (userNameExist) {
            return res.status(400).json({
                success: false,
                message: "UserName already taken"
            });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)
        const userData = new User({
            firstName: firstName,
            lastName: lastName,
            email: email,
            userName: userName,
            phoneNumber: phoneNumber,
            password: hashedPassword,
            image: uploadedImage.secure_url,
            isAdmin: false
        });
        await userData.save();
        return res.status(200).json({
            success: true,
            message: "User Created Successfully",
            userData,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

const signin = async (req, res) => {
    const { userName, password } = req.body;
    if (!userName || !password) {
        return res.status(400).json({
            success: false,
            message: "Please Enter all fields"
        });
    }
    try {
        const userData = await User.findOne({ userName: userName });
        if (!userData) {
            return res.status(400).json({
                success: false,
                message: "Invalid Username"
            });
        }
        const checkDatabasePassword = userData.password;
        const isMatched = await bcrypt.compare(password, checkDatabasePassword);
        if (!isMatched) {
            return res.status(400).json({
                success: false,
                message: "Invalid Password"
            });
        }
        const payload = {
            id: userData._id,
            userName: userData.userName,
            email: userData.email,
            fullName: userData.fullName,
            phoneNumber: userData.phoneNumber,
            image: userData.image
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "6hr" });


        res.status(201).json({
            success: true,
            token: token,
            userData,
            message: "Login Successfully"
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

  
//User Profile 
const userProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User Not Found"
            })
        }
        return res.status(201).json({
            success: true,
            user,
        })
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            success: false,
            message: "Inernal Server Error"
        })
    }
}

const updateProfile = async (req, res) => {
    const { fullName, email, userName, phoneNumber, password } = req.body;
    const image = req.files && req.files.image;

    try {
        let updateProfile = {
            fullName,
            email,
            userName,
            phoneNumber
        };

        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateProfile.password = await bcrypt.hash(password, salt);
        }

        if (image) {
            const uploadedImage = await cloudinary.v2.uploader.upload(
                image.path,
                {
                    folder: "lms/profile",
                    crop: "scale"
                }
            );
            updateProfile.image = uploadedImage.secure_url;
        }

        await User.findByIdAndUpdate(req.params.id, updateProfile, { new: true });

        res.json({
            success: true,
            updateProfile,
            message: "Update Successfully",
        });
    } catch (error) {
        console.error(`Error in updating profile: ${error}`);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};



module.exports = {
    signUp, signin, userProfile, updateProfile
};