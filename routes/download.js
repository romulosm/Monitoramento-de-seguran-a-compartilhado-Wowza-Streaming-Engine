var express = require('express');
var router = express.Router();
var db = require('../db');
var config = require('../config');
var MongoClient = require('mongodb').MongoClient;
var bcrypt = require('bcrypt');


router.get('/', (req, res, next) => {
    const handler = (err, resp) => {
        if (!err) {
            res.json({
                resp,
            });
        }
        else {
            res.json({
                success: false,
                message: 'Erro ao procurar clientes',
            });
        }
    }
    db.findAllClients(req, handler);
});



module.exports = router;