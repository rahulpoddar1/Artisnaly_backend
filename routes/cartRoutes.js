const router = require("express").Router()
const cartController = require("../controller/cartController")

router.post("/add", cartController.addToCart)
router.get("/get/:userId", cartController.getCartDetails)
router.delete("/delete", cartController.removeFromCart)

module.exports = router