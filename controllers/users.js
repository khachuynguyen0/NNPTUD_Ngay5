let userModel = require("../schemas/users");
let bcrypt = require('bcrypt')
let jwt = require('jsonwebtoken')
let fs = require('fs')
let path = require('path')

// Đọc RSA key pair (RS256)
let privateKey = fs.readFileSync(path.join(__dirname, '../private.pem'), 'utf8')
let publicKey = fs.readFileSync(path.join(__dirname, '../public.pem'), 'utf8')

module.exports = {
    privateKey,
    publicKey,

    CreateAnUser: async function (username, password, email, role, fullName, avatarUrl, status, loginCount) {
        let newItem = new userModel({
            username: username,
            password: password,
            email: email,
            fullName: fullName,
            avatarUrl: avatarUrl,
            status: status,
            role: role,
            loginCount: loginCount
        });
        await newItem.save();
        return newItem;
    },

    GetAllUser: async function () {
        return await userModel.find({ isDeleted: false })
    },

    GetUserById: async function (id) {
        try {
            return await userModel.findOne({
                isDeleted: false,
                _id: id
            })
        } catch (error) {
            return false;
        }
    },

    QueryLogin: async function (username, password) {
        if (!username || !password) {
            return false;
        }
        let user = await userModel.findOne({
            username: username,
            isDeleted: false
        })
        if (user) {
            if (bcrypt.compareSync(password, user.password)) {
                // Dùng RS256 với private key thay vì 'secret'
                return jwt.sign(
                    { id: user.id },
                    privateKey,
                    { algorithm: 'RS256', expiresIn: '1d' }
                )
            } else {
                return false;
            }
        } else {
            return false;
        }
    },

    // Đổi mật khẩu – yêu cầu đăng nhập
    ChangePassword: async function (userId, oldPassword, newPassword) {
        let user = await userModel.findOne({ _id: userId, isDeleted: false })
        if (!user) return { success: false, message: 'Không tìm thấy người dùng' }

        // Kiểm tra mật khẩu cũ
        let isMatch = bcrypt.compareSync(oldPassword, user.password)
        if (!isMatch) return { success: false, message: 'Mật khẩu cũ không đúng' }

        // Cập nhật mật khẩu mới (schema middleware sẽ hash tự động)
        user.password = newPassword
        await user.save()
        return { success: true, message: 'Đổi mật khẩu thành công' }
    }
}