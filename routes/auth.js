var express = require('express');
var router = express.Router();
var rimraf = require("rimraf");
//CONFIG
const config = require('../config');
// JWT
var jwt = require('jsonwebtoken');
// BYBRUPT
var bcrypt = require('bcrypt');
// DB
var db = require('../db');


function verifyJWT(req, res, next){
    let token = req.headers['authorization'].split(' ')[1]; 
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
    
    else{
        jwt.verify(token, config.JWT_KEY, (err, decode) => {
            if (!err) {

                next();
            }
            else {
                res.status(401).json({
                    success: false,
                    message: 'Token invalid'
            })
        }
        });
    }
}


// Rota resposável por fazer o login e gerar um token para transações
router.post('/login', (req, res, next) => {
    const { email, password } = req.body.userData;

    if (email === undefined || password === undefined) {
        res.status(401).json({
            success: false,
            code: 'Erro na autenticação com a API',
            message: 'USUÁRIO OU SENHA INCORRETOS'
        });
    }
    else {
        const handler = (err, result) => {
            if (!err && result !== null && bcrypt.compareSync(password, result.password)) {
                if (result.email) {
                    let tokenData = {
                        name: result.nome,
                        email: result.email,
                        userlevel: result.userlevel
                    }
                    console.log(tokenData);
                    let generateToken = jwt.sign(tokenData, config.JWT_KEY, { expiresIn: '365d' });
                    res.json({
                        success: true,
                        token: generateToken
                    });
                }
                else {
                    let tokenData = {
                        nome: result.nomeClient,
                        email: result.emailClient,
                        userlevel: result.userlevel
                    }
                    console.log(tokenData);
                    let generateToken = jwt.sign(tokenData, config.JWT_KEY, { expiresIn: '365d' });
                    res.json({
                        success: true,
                        token: generateToken
                    });
                }

            }
            else {
                res.status(401).json({
                    success: false,
                    code: 'Erro de autenticação com a API',
                    message: err
                });
            }
        }
        db.findUser({ email }, handler);
    }
});

// Rota responsável verificar se o Token é válido
router.get('/verifytoken', verifyJWT, (req, res, next) => {
    let token = req.headers['authorization'].split(' ')[1];
    jwt.verify(token, config.JWT_KEY, (err, decode) => {
        if (!err) {
            console.log(decode.userlevel);
            res.json({
                success: true,
                message: 'Token é válido'
            });
        }
        else {
            console.log(decode);
            res.status(401).json({
                success: false,
                message: err
            })
        }
    });
});

// Rota responsável verificar se o Token é válido
router.get('/verification', verifyJWT, (req, res, next) => {

    res.status(200).json({
        success: true,
        message: 'Estou online'
    })
});

// Rota responsável verificar se o Token é válido
router.get('/teste',(req, res, next) => {
    func.isAuth("teste");
});






module.exports = router;

