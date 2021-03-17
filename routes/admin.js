var express = require('express');
var router = express.Router();
var db = require('../db');
var config = require('../config');
var MongoClient = require('mongodb').MongoClient;
var bcrypt = require('bcrypt');
var request = require('request');
var ipAddCam = require('../config');
var jwt = require('jsonwebtoken');


function verifyJWT(req, res, next) {
    let token = req.headers['authorization'].split(' ')[1];
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

    else {
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

// Rota responsável por cadastrar o cliente no banco de dados origatório o envio do email do administrador
router.post('/registerclient', verifyJWT, (req, res, next) => {
    const { emailAdmin, nomeClient, emailClient, password, nomeEmpresa, CNPJouCPF, sobreNomeClient, endereco, cidade, estado, CEP, userlevel } = req.body.userData;
    
    const hash = bcrypt.hashSync(password, config.SALT_ROUNDS);
    const dataToInsert = {
        emailAdmin, nomeClient, emailClient, password: hash, nomeEmpresa, CNPJouCPF, sobreNomeClient, endereco, cidade, estado, CEP, userlevel
    }
    const handler = (err, result) => {
        if (!result) {
            res.json({
                sucess: true,
                message: 'Cliente registrado',
            });
        }
        else {
            res.json({
                success: false,
                message: 'Cliente não registrado',
            });
        }
    }
    db.registerClient(dataToInsert, handler);
});

router.post('/startstream', (req,res,next) => {
    try {
        const { url } = req.body.userData;
        const Stream = require('node-rtsp-stream-jsmpeg')
        const options = {
        name: 'streamName',
        url: url,
        wsPort: 3333
        }

        stream = new Stream(options)
        if(stream.start()){
            res.json({
                sucess: true,
                message: 'Sucesso',
            });
        }
    }catch (error) {
        stream.stop();
        stream.mpeg1Muxer.stream.kill();
    }
});

router.post('/stopstream', (req,res,next) => {
    try {
        stream.stop();
        stream.mpeg1Muxer.stream.kill();
        res.json({
            sucess: true,
            message: 'Sucesso',
        });
    }catch (error) {
        
    }
});

router.post('/registercam', verifyJWT, (req, res, next) => {
    const { emailAdmin, emailClient, nomeCamera, descricao, RTSP, quality, folder } = req.body.userData;
    const dataToInsert = {
        emailAdmin, emailClient, nomeCamera, descricao, RTSP, quality}
    const handler = (err, result) => {
        if (!err) {
            res.json({
                sucess: true,
                message: 'Câmera cadastrada com sucesso',
            });
        }
        else {
            res.json({
                success: false,
                message: 'Câmera não cadastrada',
            });
        }
    }
    db.registerCAM(dataToInsert, handler);
});


router.post('/consultaCAM', verifyJWT, (req, res, next) => {
    const { email } = req.body.userData;

    const dataToInsert = {
        email
    }
    const handler = (err, result) => {
        if (!err) {
            res.json(result);
        }
        else {
            res.json(err);
        }
    }
    db.consultaCameraAdmin(dataToInsert, handler);
});

//Acha câmera pelo endereço RTSP (verifica se uma câmera com o mesmo RTSP já está cadastrada)
router.post('/consultaCAMbyRTSP', verifyJWT, (req, res, next) => {
    try{
        const { rtsp } = req.body.userData;
        const dataToInsert = {
            rtsp
        }
        const handler = (err, result) => {
            if (!err) {
                if(JSON.stringify(result).length > 2){
                    res.json("true");
                }else{
                    res.json("false");
                }
                //res.json(result);
            }
            else {
                console.log("erro");
                res.json(err);
            }
        }
        db.consultaCameraAdminRTSP(dataToInsert, handler);
    }catch (error) {
        console.log(error);
    }
});

//Acha câmera pelo nome (verifica se uma câmera com o mesmo RTSP já está cadastrado para o usuário)
router.post('/consultaCAMbyName', verifyJWT, (req, res, next) => {
    try{
        let { nomeCamera } = req.body.userData;
        const dataToInsert = {
            nomeCamera
        }
        const handler = (err, result) => {
            if (!err) {
                if(JSON.stringify(result).length > 2){
                    res.json("true");
                }else{
                    res.json("false");
                }
                //res.json(result);
            }
            else {
                res.json(err);
            }
        }
        db.consultaCameraAdminName(dataToInsert, handler);
    }catch (error) {
        console.log(error);
    }
});

//Acha grupo pelo nome (verifica se grupo com mesmo nome existe para o admin)
router.post('/consultaGrupobyName', verifyJWT, (req, res, next) => {
    try{
        let { nomeGrupo, emailAdmin } = req.body.userData;
        const dataToInsert = {
            nomeGrupo,
            emailAdmin
        }
        const handler = (err, result) => {
            if (!err) {
                if(JSON.stringify(result).length > 2){
                    res.json("true");
                }else{
                    res.json("false");
                }
                //res.json(result);
            }
            else {
                res.json(err);
            }
        }
        db.consultaGrupoName(dataToInsert, handler);
    }catch (error) {
        console.log(error);
    }
});



// Rota responsável por procurar todos os clientes do admin
router.post('/listclients', verifyJWT, (req, res, next) => {
    const { emailAdmin } = req.body.userData;
    const dataToInsert = {
        emailAdmin
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
    db.findClients(dataToInsert, handler);
});

// Função responsável por enviar o perfil de um cliente
router.post('/profileclient', verifyJWT, (req, res, next) => {
    const { emailClient } = req.body.userData;
    const dataToInsert = {
        emailClient
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
    db.findProfileClient(dataToInsert, handler);
});

// verificar se está ativo <---------------------------------------------
router.post('/listprofile', verifyJWT, (req, res, next) => {
    const { email } = req.body.userData;
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
                message: 'Erro ao procurar Admin',
            });
        }
    }
    db.findProfile(dataToInsert, handler);
});


// Rota responsável por cadastrar o cliente no banco de dados origatório o envio do email do administrador
router.post('/editclientprofile', verifyJWT, (req, res, next) => {
    const {emailAdmin, nomeClient, emailClient, password, nomeEmpresa, CNPJouCPF, sobreNomeClient, endereco, cidade, estado, CEP, emailClientAntigo } = req.body.userData;
    const dataToInsert = {
        emailAdmin,
        nomeClient,
        emailClient,
        password,
        nomeEmpresa,
        CNPJouCPF,
        sobreNomeClient,
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
    db.updateClient(dataToInsert, handler);
});


// Rota responsável por excluir um usuário do banco
router.delete('/deleteclient/:email', verifyJWT, (req, res, next) => {
    const emailClient  = req.params.email;
    const dataToInsert = {
        emailClient,
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
    db.deleteClient(dataToInsert, handler);
});

// Rota responsável editar as câmeras dentro dos documentos ADMIN, CLIENT e WOWZA
router.post('/editacamera', verifyJWT, (req, res, next) => {
    const { emailClient, emailAdmin, descricao, RTSP, nomeCamera } = req.body.userData;
    const dataToInsert = {
        emailClient,
        emailAdmin,
        descricao,
        RTSP,
        nomeCamera,
    }
    const handler = (err, result) => {
        if (!err) {
            res.json({
                sucess: true,
                message: 'Câmera alterada com sucesso',
            });
        }
        else {
            res.json({
                success: false,
                message: 'Câmera não alterada',
            });
        }
    }
    db.editaCamera(dataToInsert, handler);
});



// Rota responsável por deletar uma Câmera do Usuário
router.post('/deletecam', verifyJWT, (req, res, next) => {
    try{
        const { emailClient, nomeCamera, emailAdmin } = req.body.userData;
        const dataToInsert = {
            emailClient,
            nomeCamera,
            emailAdmin
        }
        const handler = (err, result) => {
            if (!err) {
                res.json({
                    sucess: true,
                    message: 'Câmera removida com sucesso',
                });
            }
            else {
                res.json({
                    success: false,
                    message: 'Câmera não removida',
                });
            }
        }
        db.deleteCAM(dataToInsert, handler);
    }catch(error){
        console.log(error);
    }
});

// Rota responsável por deletar um grupo
router.post('/deletegrupo', verifyJWT, (req, res, next) => {
    try{
        const { grupo, emailAdmin } = req.body.userData;
        const dataToInsert = {
            grupo,
            emailAdmin
        };
        const handler = (err, result) => {
            if (!err) {
                res.json({
                    sucess: true,
                    message: 'Grupo de usuários criados com sucesso',
                });
            }
            else {
                res.json({
                    success: false,
                    message: 'Houve algum erro, por favor verifique os dados',
                });
            }
        }
        db.deleteGrupo(dataToInsert, handler);
    }catch(error){
        console.log(error);
    }
});

// Rota responsável por adicionar um grupo
router.post('/addgrupo', verifyJWT, (req, res, next) => {
    try{
        const { nomeGrupo, cameras, emailAdmin, emailClients } = req.body.userData;
        var grupoCameras = [];
        var grupoUsers = [];
        var obj = JSON.parse(emailClients);
        var obj2 = JSON.parse(cameras);
        for (var i = 0; i < obj.length - 1; i++) {
            var email = obj[i].emailClient;
            grupoUsers = grupoUsers.concat(email);
        }
        for (var i = 0; i < obj2.length - 1; i++) {
            var camera = {"nomeCamera": obj2[i].nomeCamera, "folder":obj2[i].folder};
            grupoCameras = grupoCameras.concat(camera);
        }
        const dataToInsert = {
            grupoUsers,
            cameras,
            emailAdmin,
            grupoCameras,
            nomeGrupo
        };
        const handler = (err, result) => {
            if (!err) {
                res.json({
                    sucess: true,
                    message: 'Grupo de usuários criados com sucesso',
                });
            }
            else {
                res.json({
                    success: false,
                    message: 'Houve algum erro, por favor verifique os dados',
                });
            }
        }
        db.addGrupo(dataToInsert, handler);
    }catch(error){
        console.log(error);
    }
});

// Rota responsável por adicionar um novo cliente a um grupo
router.post('/addclientgrupo', verifyJWT, (req, res, next) => {
    try{
        const { emailClients, emailAdmin, grupoSelected } = req.body.userData;
        const dataToInsert = {
            emailClients,
            emailAdmin,
            grupoSelected
        };
        const handler = (err, result) => {
            if (!err) {
                res.json({
                    sucess: true,
                    message: 'Grupo de usuários criados com sucesso',
                });
            }
            else {
                res.json({
                    success: false,
                    message: 'Houve algum erro, por favor verifique os dados',
                });
            }
        }
        db.addClientGrupo(dataToInsert, handler);
    }catch(error){
        console.log(error);
    }
});

// Rota responsável por deletar um novo cliente de um grupo
router.post('/deleteclientgrupo', verifyJWT, (req, res, next) => {
    try{
        const { emailClient, emailAdmin, grupoSelected } = req.body.userData;
        const dataToInsert = {
            emailClient,
            emailAdmin,
            grupoSelected
        };
        const handler = (err, result) => {
            if (!err) {
                res.json({
                    sucess: true,
                    message: 'Grupo de usuários criados com sucesso',
                });
            }
            else {
                res.json({
                    success: false,
                    message: 'Houve algum erro, por favor verifique os dados',
                });
            }
        }
        db.deleteClientGrupo(dataToInsert, handler);
    }catch(error){
        console.log(error);
    }
});

router.post('/addcameragrupo', verifyJWT, (req, res, next) => {
    try{
        const { cameras, emailAdmin, grupoSelected } = req.body.userData;
        const dataToInsert = {
            cameras,
            emailAdmin,
            grupoSelected
        };
        const handler = (err, result) => {
            if (!err) {
                res.json({
                    sucess: true,
                    message: 'Grupo de usuários criados com sucesso',
                });
            }
            else {
                res.json({
                    success: false,
                    message: 'Houve algum erro, por favor verifique os dados',
                });
            }
        }
        db.addCameraGrupo(dataToInsert, handler);
    }catch(error){
        console.log(error);
    }
});

router.post('/deletecameragrupo', verifyJWT, (req, res, next) => {
    try{
        const { camera, emailAdmin, grupoSelected } = req.body.userData;
        const dataToInsert = {
            camera,
            emailAdmin,
            grupoSelected
        };
        const handler = (err, result) => {
            if (!err) {
                res.json({
                    sucess: true,
                    message: 'Grupo de usuários criados com sucesso',
                });
            }
            else {
                res.json({
                    success: false,
                    message: 'Houve algum erro, por favor verifique os dados',
                });
            }
        }
        db.deleteCameraGrupo(dataToInsert, handler);
    }catch(error){
        console.log(error);
    }
});


module.exports = router;