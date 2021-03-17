var express = require('express');
var router = express.Router();
var request = require('request');
var ipAddCam = require('../config');
var jwt = require('jsonwebtoken');
const config = require('../config');
var jwt = require('jsonwebtoken');

function verifyJWT(req, res, next){
    let token = req.headers['authorization'].split(' ')[1];
    console.log(token);
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

router.post('/addcam', verifyJWT, (req, res, next) =>{
    const {token, emailAdmin, user, cliente, IP, descricao, nomecamera} = req.body.userData;
    jwt.verify(token, config.JWT_KEY, (err, decode) => {
        if(!err && decode.userlevel==='admin'){
            request.post({ headers:{'content-type':'application/json'},url:ipAddCam.WOWZAADDCAM,
                body:{'name':nomecamera,'serverName':'_defaultServer_', 'uri':IP}, json:true}
                ,function(error, response, body){
                    if(!error){
                        res.status(201).json({
                            success: true,
                            code: 'Câmera cadastrada com sucesso',
                            message: body
                        }); 
                    }
                    else{
                        res.status(400).json({
                            success: false,
                            code: 'Erro ao registrar câmera',
                            message: error
                        });
                    }
            });
        }
        else{
            res.status(401).json({
                success: false,
                message: err
            })
        }
    });
});

router.post('/deletecam', verifyJWT, (req, res, next) =>{
    const {token, emailAdmin, cliente, nomecamera} = req.body.userData;
    request.delete({ headers:{'content-type':'application/json'},url:ipAddCam.WOWZADELETECAM+nomecamera,
        body:{}, json:true}
        ,function(error, response, body){
            if(!error){
                res.status(200).json({
                    success: true,
                    code: 'Câmera excluida com sucesso',
                    message: body
                }); 
            }
            else{
                res.status(400).json({
                    success: false,
                    code: 'Erro ao excluir câmera',
                    message: error
                });
            }
    });
});


module.exports = router;
