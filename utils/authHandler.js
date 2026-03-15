let userController = require('../controllers/users')
let jwt = require('jsonwebtoken')
let { publicKey } = userController

module.exports = {
    CheckLogin: async function (req, res, next) {
        try {
            let token = req.headers.authorization;
            if (!token || !token.startsWith("Bearer")) {
                res.status(403).send({ message: "Bạn chưa đăng nhập" })
                return;
            }
            token = token.split(' ')[1]
            // Verify bằng public key, thuật toán RS256
            let result = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
            if (result.exp * 1000 < Date.now()) {
                res.status(403).send({ message: "Token đã hết hạn" })
                return;
            }
            let getUser = await userController.GetUserById(result.id);
            if (!getUser) {
                res.status(403).send({ message: "Không tìm thấy người dùng" })
            } else {
                req.user = getUser;
                next();
            }
        } catch (error) {
            res.status(403).send({ message: "Bạn chưa đăng nhập" })
        }
    }
}