var express = require("express");
var router = express.Router()
let userController = require('../controllers/users')
let { RegisterValidator, ChangePasswordValidator, validatedResult } = require('../utils/validator')
let { CheckLogin } = require('../utils/authHandler')

// Login
router.post('/login', async function (req, res, next) {
    let { username, password } = req.body;
    let result = await userController.QueryLogin(username, password);
    if (!result) {
        res.status(404).send("Thông tin đăng nhập không đúng")
    } else {
        res.send(result)
    }
})

// Register
router.post('/register', RegisterValidator, validatedResult, async function (req, res, next) {
    let { username, password, email } = req.body;
    let newUser = await userController.CreateAnUser(
        username, password, email, '69b6231b3de61addb401ea26'
    )
    res.send(newUser)
})

// Lấy thông tin người dùng hiện tại (yêu cầu đăng nhập)
router.get('/me', CheckLogin, function (req, res, next) {
    res.send(req.user)
})

// Đổi mật khẩu (yêu cầu đăng nhập)
router.post('/change-password', CheckLogin, ChangePasswordValidator, validatedResult, async function (req, res, next) {
    let { oldPassword, newPassword } = req.body;
    let userId = req.user._id;
    let result = await userController.ChangePassword(userId, oldPassword, newPassword);
    if (!result.success) {
        res.status(400).send({ message: result.message })
    } else {
        res.send({ message: result.message })
    }
})

module.exports = router;