var express = require('express');
var router = express.Router();
var connection = require('../library/database');
var fileSystem = require('fs');
var multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'public/images');
    },
    filename: (req, file, callback) => {
        callback(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

/* GET home page. */
router.get('/', function(req, res, next) {
    connection.query(`SELECT * FROM tbl_product ORDER BY id desc`, function(error, rows) {
      if(error) {
        req.flash('Error', error);
        res.render('dashboard', { email: req.session.email, role: req.session.role, data: '', product: 'Semua Produk' })
      } else {
        res.render('dashboard', { email: req.session.email, role: req.session.role, data: rows, product: 'Semua Produk' })
      }
    })
});

router.get('/foods', function(req, res, next) {
    connection.query(`SELECT * FROM tbl_product WHERE product_type = 'Food' ORDER BY id desc`, function(error, rows) {
      if(error) {
        req.flash('Error', error);
        res.render('dashboard', { email: req.session.email, role: req.session.role, data: '', product: 'Makanan' })
      } else {
        res.render('dashboard', { email: req.session.email, role: req.session.role, data: rows, product: 'Makanan' })
      }
    })
});

router.get('/drinks', function(req, res, next) {
  connection.query(`SELECT * FROM tbl_product WHERE product_type = 'Drink' ORDER BY id desc`, function(error, rows) {
    if(error) {
      req.flash('Error', error);
      res.render('dashboard', { email: req.session.email, role: req.session.role, data: '', product: 'Minuman' })
    } else {
      res.render('dashboard', { email: req.session.email, role: req.session.role, data: rows, product: 'Minuman' })
    }
  })
});

router.get('/delete/:idData', function(req, res) {
  let idData = req.params.idData

  connection.query(`SELECT product_image FROM tbl_product WHERE id = ${idData}`, function(error, results) {
    if(error) {
      req.flash('error', error);
      res.redirect(`/`);
    }else {
      let deleteImage = results[0].image
      if(deleteImage) fileSystem.unlinkSync('public/images/' + deleteImage);

      connection.query(`DELETE FROM tbl_product WHERE id = ${idData}`, function(error, results) {
        if(error) {
          req.flash('error', error);
          res.redirect(`/`);
        }else {
          req.flash('Success', 'Data already be deleted');
          res.redirect(`/`);
        }
      });
    }
  })
})

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
