var express = require('express');
var router = express.Router();
var connection = require('../library/database');
var fileSystem = require('fs');
var multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

router.get('/addProduct', function(req, res) {
    res.render('addProduct', {
        action: '/store',
        product_name: '',
        product_price: '',
        product_description: '',
        product_type: '',
        product_image: ''
    })
});

router.post('/store', upload.single('product_image'), function(req, res, next) {
    let productName = req.body.product_name
    let productPrice = req.body.product_price
    let productDescription = req.body.product_description
    let productType = req.body.product_type
    let productImage = req.file ? req.file.originalname : '';
    let errors      = false
    console.log(productName, productPrice, productImage, productType, productDescription);

    if(productName.length === 0 || productPrice.length === 0 || productType.length === 0 || productDescription.length === 0 || productImage.length === 0) {
        errors = true
        req.flash('error', 'Invalid input data')
        res.render('addProduct', {
            product_name: product_name,
            product_price: product_price,
            product_description: product_description,
            product_type: product_type,
            product_image: product_image
        })
    }

    if(!errors) {
        let formData = {
            product_name: productName,
            product_price: productPrice,
            product_description: productDescription,
            product_type: productType,
            product_image: productImage
        }
        connection.query('INSERT INTO tbl_product SET ?', formData, function(error, result) {
            if(error) {
                req.flash('error', error)
                res.render('addProduct', {
                    product_name: formData.product_name,
                    product_type: formData.product_price,
                    product_description: formData.product_description,
                    product_type: formData.product_type,
                    product_image: formData.product_image
                })
            }else {
                req.flash('Success', 'Data Product already be saved');
                res.redirect('/')
            }
        })
    }
});

router.get('/editProduct/:idData', function(req, res, next) {
    let idData = req.params.idData

    connection.query(`SELECT * FROM tbl_product WHERE id = ${idData}`, function(error, rows) {
        if(error) throw error

        if(req.length <= 0) {
            req.flash('Error', `Data dengan ID ${idData} tidak ditemukan`);
            res.redirect('/')
        } else {
            res.render('addProduct', { 
                action: `/update/${idData}`,
                product_name: rows[0].product_name,
                product_price: rows[0].product_price,
                product_description: rows[0].product_description,
                product_type: rows[0].product_type,
                product_image: rows[0].product_image
            });
        }
    });
});

router.post('/update/:idData', upload.single('image'), function(req, res, next) {
    let idData = req.params.idData
    let productName = req.body.product_name
    let productPrice = req.body.price
    let productDescription = req.body.product_description
    let productType = req.body.product_type
    let errors = false

    if (productName.length === 0 || productPrice.length === 0 || productType.length === 0 || productDescription.length === 0) {
        errors = true
        req.flash('error', 'Invalid input data')
        return res.render('addProduct', {
            product_name: productName,
            product_price: productPrice,
            product_description: productDescription,
            productType: productType,
        })
    }

    connection.query(`SELECT image FROM tbl_product WHERE id = ${idData}`, function(error, results) {
        if (error) {
            req.flash("error", error);
            return res.render("addProduct", {
                product_name: product_name,
                product_price: product_price,
                product_description: product_description,
                product_type: product_type,
            });
        }

        let prevImage = results[0].image

        if (prevImage) {
            fileSystem.unlinkSync('public/images/' + prevImage);
        }

        let formData = {
            product_name: productName,
            product_price: productPrice,
            product_description: productDescription,
            product_type: productType,
        }

        if (req.file) {
            formData.productImage = req.file.originalname
        }

        connection.query(`UPDATE tbl_product SET ? WHERE id = ${idData}`, formData, function(error, result) {
            if (error) {
                req.flash('error', error)
                return res.render('addProduct', {
                    product_name: formData.product_name,
                    product_price: formData.product_price,
                    product_description: formData.product_description,
                    product_type: formData.product_type,
                    product_image: formData.product_image
                })
            } else {
                req.flash('success', 'Product data has been updated');
                return res.redirect('/')
            }
        })
    })
});

module.exports = router