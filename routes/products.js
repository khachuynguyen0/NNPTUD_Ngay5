var express = require('express');
var router = express.Router();
let productModel = require('../schemas/products');
const { default: slugify } = require('slugify');
let { verifyToken } = require('../middleware/auth');

// READ ALL - Lấy tất cả sản phẩm chưa bị xóa
router.get('/', async function (req, res, next) {
    let result = await productModel.find({ isDeleted: false });
    res.send(result);
});

// READ ONE - Lấy 1 sản phẩm theo ID
router.get('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await productModel.findOne({ isDeleted: false, _id: id });
        if (result) {
            res.send(result);
        } else {
            res.status(404).send({ message: "ID NOT FOUND" });
        }
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

// CREATE - Thêm sản phẩm mới (yêu cầu đăng nhập)
router.post('/', verifyToken, async function (req, res, next) {
    try {
        let newProduct = new productModel({
            title: req.body.title,
            slug: slugify(req.body.title, {
                replacement: '-',
                remove: undefined,
                lower: true,
                strict: false,
            }),
            price: req.body.price,
            description: req.body.description,
            images: req.body.images,
            category: req.body.category,
        });
        await newProduct.save();
        res.send(newProduct);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// UPDATE - Cập nhật sản phẩm theo ID (yêu cầu đăng nhập)
router.put('/:id', verifyToken, async function (req, res, next) {
    try {
        let id = req.params.id;
        // Nếu có cập nhật title thì tự động cập nhật slug theo
        if (req.body.title) {
            req.body.slug = slugify(req.body.title, {
                replacement: '-',
                remove: undefined,
                lower: true,
                strict: false,
            });
        }
        let updatedItem = await productModel.findByIdAndUpdate(id, req.body, { new: true });
        res.send(updatedItem);
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

// DELETE - Xóa mềm sản phẩm theo ID (yêu cầu đăng nhập)
router.delete('/:id', verifyToken, async function (req, res, next) {
    try {
        let id = req.params.id;
        let updatedItem = await productModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
        res.send(updatedItem);
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

module.exports = router;
