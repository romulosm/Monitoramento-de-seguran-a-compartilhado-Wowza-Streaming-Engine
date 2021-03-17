/*
-> Rota responsável por todas as operações realizadas pelo Cliente
*/
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

// Rota responsável por enviar todas as câmeras dentro do usuário
router.get('/minhacam/:emailclient',verifyJWT,(req, res, next) => {
    const emailClient = req.params.emailclient;
    const dataToInsert = {
        emailClient,
    }
    const handler = (err, resp) =>{
        if(!err)
        {
            res.json(resp);
        }
        else{
            res.json({
                success:false,
                message: 'Error finding cameras',
            });
        }
    }
    db.findCam(dataToInsert, handler);
});

//Lista todas as gravações do cliente que foi enviado e-mail
router.post('/listrecords',verifyJWT,(req,res,next) => {
    const {folder,emailClient}= req.body.userData;
    const testFolder = config.ADDRESSFOLDER+folder;
    const fs = require('fs');
    let filesList = [];
    let fileFilter;
    fs.readdir(testFolder, (err, files) => {
        files.forEach((file, index) => {
            fileFilter = file.split("-");
            if(fileFilter[0]===emailClient){
                filesList.push(file);
            }
        });
        res.json(filesList);
    });
});


router.post('/insertordercam', verifyJWT,(req, res, next) => {
    try{
        const {orderCameras, layout, emailClient}= req.body.userData;
        const dataToInsert = {
            orderCameras,
            layout,
            emailClient
        }
        const handler = (err, resp) =>{
            if(!err)
            {
                res.json({
                    sucess: true,
                    message: 'successfully registered order'
                });
            }
            else{
                res.json({
                    success:false,
                    message: 'error registering camera order',
                });
            }
        }
        db.registerOrderCam(dataToInsert, handler);
    }catch (error) {
        console.log(error);
    }
});

// Inserir ordem da camera dentro do grupo
router.post('/insertordergroup',verifyJWT,(req, res, next) => {
    try{
        const {orderCameras, emailClient, nameGroup}= req.body.userData;
        const dataToInsert = {
            orderCameras,
            emailClient,
            nameGroup
        }
        const handler = (err, resp) =>{
            if(!err)
            {
                res.json({
                    sucess: true,
                    message: 'successfully registered order'
                });
            }
            else{
                res.json({
                    success:false,
                    message: 'error registering camera order',
                });
            }
        }
        db.insertordergroup(dataToInsert, handler);
    }catch (error) {
        console.log(error);
    }
});


router.get('/findordercam/:email',verifyJWT,(req, res, next) => {
    const emailClient = req.params.email;
    const dataToInsert = {
        emailClient
    }
    const handler = (err, resp) =>{
        if(!err)
        {
            var data = resp[0].orderCameras;
            res.json(data);
        }
        else{
            res.json({
                success:false,
                message: 'Erro ao encontrar câmeras registradas',
            });
        }
    }
    db.findOrderCam(dataToInsert, handler);
});

module.exports = router;