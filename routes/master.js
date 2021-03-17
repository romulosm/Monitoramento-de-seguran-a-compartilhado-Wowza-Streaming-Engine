
// Rotas específicas para manipulação de dados pelo Administrador master (Flybyte)

var express = require('express');
var router = express.Router();
var db = require('../db');
var config = require('../config');
var MongoClient = require('mongodb').MongoClient;
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');


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

// Rota responsável por excluir um admin do banco
router.delete('/deleteadmin/:email', verifyJWT, (req, res, next) => {
    const email  = req.params.email;
    const dataToInsert = {
        email,
    }

    const handler = (err, result) => {
        if (!err) {
            res.json({
                sucess: true,
                message: 'Cliente deletado com sucesso',
            });
        }
        else {
            res.json({
                success: false,
                message: 'Cliente não deletado',
            });
        }
    }
    db.deleteAdmin(dataToInsert, handler);
});

// Rota responsável por cadastrar o Admin no banco de dados
router.post('/register',verifyJWT,(req, res, next) => {
    const token = req.headers['authorization'].split(' ')[1];
    const {razaosocial, CNPJouCPF, email, nome, sobrenome, endereco, cidade, estado, CEP, plano, password, userlevel} = req.body.userData;
    const hash = bcrypt.hashSync(password, config.SALT_ROUNDS);
    const dataToInsert = { razaosocial, CNPJouCPF, email, nome, sobrenome, endereco, cidade, estado, CEP, plano, "password":hash, userlevel, token};
    const handler = (err, result) =>{
        if(!err)
        {
            res.json({
                sucess:true,
                message: 'Usuário registrado',
                data: result
            });
        }
        else{
            res.json({
                success:false,
                message: 'Usuário não registrado',
                error: err
            });
        }
    }
    db.registerAdmin(dataToInsert, handler);
});

router.get('/listclients',verifyJWT, (req, res, next) => {
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

router.get('/listadmin',verifyJWT, (req, res, next) => {
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
    db.findAllAdmin(req, handler);
});

router.get('/profileadmin/:email',verifyJWT, (req, res, next) => {
    const email = req.params.email;
    const dataToInsert = {
        email
    }
    const handler = (err, resp) => {
        if (!err) {
            res.json({
                resp,
            });
        }
        else {
            res.json({
                success: false,
                message: 'Erro ao procurar users',
            });
        }
    }
    db.findProfileAdmin(dataToInsert, handler);
});

router.get('/profilemaster/:email',verifyJWT, (req, res, next) => {
    try{
        const email = req.params.email;
        const dataToInsert = {
            email
        }
        const handler = (err, resp) => {
            if (!err) {
                res.json({
                    resp,
                });
            }
            else {
                res.json({
                    success: false,
                    message: 'Erro ao procurar users',
                });
            }
        }
        db.findProfileMaster(dataToInsert, handler);
    }catch(error){
        console.log(error);
    }
});

// Rota responsável por cadastrar o cliente no banco de dados origatório o envio do email do administrador
router.post('/editadminprofile',verifyJWT, (req, res, next) => {
    const { nome, email, password, razaosocial, CNPJouCPF, sobrenome, endereco, cidade, estado, CEP, emailClientAntigo} = req.body.userData;
    const hash = bcrypt.hashSync(password, config.SALT_ROUNDS);
    const dataToInsert = {
        nome,
        email,
        password: hash,
        razaosocial,
        CNPJouCPF,
        sobrenome,
        endereco,
        cidade,
        estado,
        CEP,
        emailClientAntigo,
    }
    
    const handler = (err, result) => {
        if (!err) {
            res.json({
                sucess: true,
                message: 'Cliente Alterado com sucesso',
            });
        }
        else {
            res.json({
                success: false,
                message: 'Cliente não alterado',
            });
        }
    }
    db.updateAdmin(dataToInsert, handler);
});



module.exports = router;