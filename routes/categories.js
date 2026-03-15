var express = require('express');
var router = express.Router();
let categoryModel = require('../schemas/categories');
const { default: slugify } = require('slugify');
let { verifyToken } = require('../middleware/auth');

// READ ALL - Lấy tất cả danh mục chưa bị xóa
router.get('/', async function (req, res, next) {
    let result = await categoryModel.find({ isDeleted: false });
    res.send(result);
});

// READ ONE - Lấy 1 danh mục theo ID
router.get('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await categoryModel.findOne({ isDeleted: false, _id: id });
        if (result) {
            res.send(result);
        } else {
            res.status(404).send({ message: "ID NOT FOUND" });
        }
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

// CREATE - Thêm danh mục mới (yêu cầu đăng nhập)
router.post('/', verifyToken, async function (req, res, next) {
    try {
        let newCate = new categoryModel({
            name: req.body.name,
            slug: slugify(req.body.name, {
                replacement: '-',
                remove: undefined,
                lower: true,
                strict: false,
            })
        });
        await newCate.save();
        res.send(newCate);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// UPDATE - Cập nhật danh mục theo ID (yêu cầu đăng nhập)
router.put('/:id', verifyToken, async function (req, res, next) {
    try {
        let id = req.params.id;
        if (req.body.name) {
            req.body.slug = slugify(req.body.name, {
                replacement: '-',
                remove: undefined,
                lower: true,
                strict: false,
            });
        }
        let updatedItem = await categoryModel.findByIdAndUpdate(id, req.body, { new: true });
        res.send(updatedItem);
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

// DELETE - Xóa mềm danh mục theo ID (yêu cầu đăng nhập)
router.delete('/:id', verifyToken, async function (req, res, next) {
    try {
        let id = req.params.id;
        let updatedItem = await categoryModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
        res.send(updatedItem);
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

module.exports = router;
