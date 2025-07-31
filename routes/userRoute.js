const router = require("express").Router()
const userController = require("../controller/userController")

router.post("/signup", userController.signUp)
router.post("/signin", userController.signin)
router.get("/profile/:id", userController.userProfile)

module.exports = router