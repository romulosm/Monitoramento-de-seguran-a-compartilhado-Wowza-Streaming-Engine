var db;
var axios = require('axios');
var request = require('request');
var config = require('../config');
var MongoClient = require('mongodb').MongoClient;
var ipAddCam = require('../config');
var bcrypt = require('bcrypt');
var md5 = require('md5');
const fs = require('fs');
var rimraf = require("rimraf");
var funcoes = require("./functions");

MongoClient.connect(config.MONGO_URL, { useUnifiedTopology: true, useNewUrlParser: true }, (err, database) => {
    if (!err) {
        console.log('Conexão estabelecida com o MongoDB');
        db = database;
    }
    else {
        console.log('Não foi possivel conectar a base de dados MongoDB')
    }
});

module.exports = {

    register: (data, handler) => {
        var dbo = db.db('Users');
        var myobj = data;
        var name = myobj.name;
        dbo.collection('Admin').insertOne(myobj, (err, res) => {
            handler(err, res);
        });
    },

    
    registerAdmin: (data, handler) => {
        var dbo = db.db('Users');
        var myobj = { "razaosocial": data.razaosocial, "CNPJouCPF": data.CNPJouCPF, "email": data.email, "nome": data.nome, "sobrenome": data.sobrenome, "endereco": data.endereco, "cidade": data.cidade, "estado": data.estado, "CEP": data.CEP, "plano": data.plano, "password": data.password, "userlevel": data.userlevel }
        dbo.collection('Admin').insertOne(myobj, (err, res) => {
            if (res) {
                if (data.userlevel === "admin/client") {
                    var token = data.token;
                    var nomeClient = data.nome;
                    var sobreNomeClient = data.sobrenome;
                    var emailAdmin = data.email;
                    var emailClient = data.email;
                    var password = data.password;
                    var nomeEmpresa = data.razaosocial;
                    var CNPJouCPF = data.CNPJouCPF;
                    var endereco = data.endereco;
                    var estado = data.estado;
                    var CEP = data.CEP;
                    var cidade = data.cidade;
                    var userlevel = data.userlevel;
                    const dados={
                        emailAdmin, nomeClient, emailClient, password, nomeEmpresa, CNPJouCPF, sobreNomeClient, endereco, cidade, estado, CEP, userlevel
                    }
                    var retorno = funcoes.addClient(dados, db);
                    console.log(retorno);
                    handler(err, res);
                }
            }
        });
    },

    //procurar um usuário no banco de dados (voltado para o Master)
    findUser: (data, handler) => {
        var dbo = db.db('Users');
        var myobj = data;
        var myobj2 = { "emailClient": myobj.email };
        dbo.collection('Admin').findOne(myobj, (err, res) => {
            if (res == null) {
                dbo.collection('Clients').findOne(myobj2, (err, res) => {
                    if (res == null) {
                        dbo.collection('Super').findOne(myobj, (err, res) => {
                            handler(err, res);
                        });
                    }
                    else {
                        handler(err, res);
                    }
                });
            }
            else {
                handler(err, res);
            }
        });
    },

    //procurar todos os seus clientes (voltado para o Admin)
    findClients: (data, handler) => {
        var dbo = db.db('Users');
        var myobj = data;
        dbo.collection('Clients').find(myobj).sort({ nomeClient: 1 }).toArray((err, res) => {
            handler(err, res);
        });
    },


    //procurar todos os seus clientes (voltado para o Admin)
    findProfileClient: (data, handler) => {
        var dbo = db.db('Users');
        var myobj = data;
        dbo.collection('Clients').find(myobj).toArray((err, res) => {
            handler(err, res);
        });
    },

    //procurar todos os seus clientes (voltado para o Admin)
    findProfile: (data, handler) => {
        var dbo = db.db('Users');
        var myobj = data;
        dbo.collection('Admin').find(myobj).toArray((err, res) => {
            handler(err, res);
        });
    },

    // inserir um cliente (no banco Client com relacionamento)
    registerClient: (data, handler) => {
        var dbo = db.db('Users');
        var nomeClient = data.nomeClient;
        var sobreNomeClient = data.sobreNomeClient;
        var emailAdmin = data.emailAdmin;
        var emailClient = data.emailClient;
        var password = data.password;
        var nomeEmpresa = data.nomeEmpresa;
        var CNPJouCPF = data.CNPJouCPF;
        var endereco = data.endereco;
        var estado = data.estado;
        var CEP = data.CEP;
        var cidade = data.cidade;
        var userlevel = data.userlevel;
        const hash = bcrypt.hashSync(emailClient, config.SALT_HASH);
        const hash2 = md5(hash);
        var folder = emailClient + "_" + hash2;
        var myobj = { "nomeClient": nomeClient, "sobreNomeClient": sobreNomeClient, "emailAdmin": emailAdmin, "emailClient": emailClient, "password": password, "nomeEmpresa": nomeEmpresa, "CNPJouCPF": CNPJouCPF, "endereco": endereco, "cidade": cidade, "estado": estado, "CEP": CEP, "userlevel": userlevel, "folder": folder };
        var dir = config.ADDRESSFOLDER + folder;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        var dado = {
            "serverName": "_defaultServer_",
            "name": folder,
            "appType": "Live",
            "applicationTimeout": 0,
            "pingTimeout": 0,
            "clientStreamReadAccess": "*",
            "clientStreamWriteAccess": "*",
            "avSyncMethod": "senderreport",
            "maxRTCPWaitTime": 12000,
            "httpCORSHeadersEnabled": true,
            "httpStreamers": [
                "cupertinostreaming",
                "smoothstreaming",
                "sanjosestreaming",
                "mpegdashstreaming"
            ],
            "mediaReaderRandomAccessReaderClass": "",
            "httpOptimizeFileReads": false,
            "mediaReaderBufferSeekIO": false,
            "captionLiveIngestType": "",
            "securityConfig": {
                "serverName": "_defaultServer_",
                "secureTokenVersion": 0,
                "clientStreamWriteAccess": "*",
                "publishRequirePassword": true,
                "publishPasswordFile": "",
                "publishRTMPSecureURL": "",
                "publishIPBlackList": "",
                "publishIPWhiteList": "",
                "publishBlockDuplicateStreamNames": false,
                "publishValidEncoders": "",
                "publishAuthenticationMethod": "digest",
                "playMaximumConnections": 0,
                "playRequireSecureConnection": false,
                "secureTokenSharedSecret": "",
                "secureTokenUseTEAForRTMP": false,
                "secureTokenIncludeClientIPInHash": false,
                "secureTokenHashAlgorithm": "",
                "secureTokenQueryParametersPrefix": "",
                "secureTokenOriginSharedSecret": "",
                "playIPBlackList": "",
                "playIPWhiteList": "",
                "playAuthenticationMethod": "none"
            },
            "streamConfig": {
                "serverName": "_defaultServer_",
                "streamType": "live",
                "storageDir": config.ADDRESSFOLDERWOWZA + folder,
                "createStorageDir": false,
                "storageDirExists": true,
                "keyDir": "${com.wowza.wms.context.VHostConfigHome}/keys",
                "liveStreamPacketizer": [
                    "cupertinostreamingpacketizer",
                    "mpegdashstreamingpacketizer",
                    "sanjosestreamingpacketizer",
                    "smoothstreamingpacketizer"
                ],
                "httpRandomizeMediaName": false
            },
            "dvrConfig": {
                "serverName": "_defaultServer_",
                "licenseType": "Subscription",
                "inUse": false,
                "dvrEnable": false,
                "windowDuration": 0,
                "storageDir": "${com.wowza.wms.context.VHostConfigHome}/dvr",
                "archiveStrategy": "append",
                "dvrOnlyStreaming": false,
                "startRecordingOnStartup": true,
                "dvrEncryptionSharedSecret": "",
                "dvrMediaCacheEnabled": false,
                "httpRandomizeMediaName": false
            },
            "drmConfig": {
                "serverName": "_defaultServer_",
                "licenseType": "Subscription",
                "inUse": false,
                "ezDRMUsername": "",
                "ezDRMPassword": "",
                "buyDRMUserKey": "",
                "buyDRMProtectSmoothStreaming": false,
                "buyDRMProtectCupertinoStreaming": false,
                "buyDRMProtectMpegDashStreaming": false,
                "verimatrixProtectCupertinoStreaming": false,
                "verimatrixCupertinoKeyServerIpAddress": "",
                "verimatrixCupertinoKeyServerPort": 0,
                "verimatrixCupertinoVODPerSessionKeys": false,
                "verimatrixProtectSmoothStreaming": false,
                "verimatrixSmoothKeyServerIpAddress": "",
                "verimatrixSmoothKeyServerPort": 0,
                "cupertinoEncryptionAPIBased": false
            },
            "transcoderConfig": {
                "serverName": "_defaultServer_",
                "available": false,
                "licensed": false,
                "licenses": 0,
                "licensesInUse": 0,
                "templates": {
                    "vhostName": "_defaultVHost_",
                    "templates": [
                        {
                            "id": "audioonly",
                            "href": "/v2/servers/_defaultServer_/vhosts/_defaultVHost_/applications/testlive/transcoder/templates/audioonly"
                        },
                        {
                            "id": "transrate",
                            "href": "/v2/servers/_defaultServer_/vhosts/_defaultVHost_/applications/testlive/transcoder/templates/transrate"
                        },
                        {
                            "id": "transcode",
                            "href": "/v2/servers/_defaultServer_/vhosts/_defaultVHost_/applications/testlive/transcoder/templates/transcode"
                        },
                        {
                            "id": "transcode-h265-divx",
                            "href": "/v2/servers/_defaultServer_/vhosts/_defaultVHost_/applications/testlive/transcoder/templates/transcode-h265-divx"
                        }
                    ]
                },
                "liveStreamTranscoder": "transcoder",
                "templatesInUse": "${SourceStreamName}.xml,transrate.xml",
                "profileDir": "${com.wowza.wms.context.VHostConfigHome}/transcoder/profiles",
                "templateDir": "${com.wowza.wms.context.VHostConfigHome}/transcoder/templates",
                "createTemplateDir": false
            },
            "webRTCConfig": {
                "serverName": "_defaultServer_",
                "enablePublish": false,
                "enablePlay": false,
                "enableQuery": false,
                "iceCandidateIpAddresses": "127.0.0.1,tcp,1935",
                "preferredCodecsAudio": "opus,vorbis,pcmu,pcma",
                "preferredCodecsVideo": "vp8,h264",
                "debugLog": false
            },
            "modules": {
                "serverName": "_defaultServer_",
                "moduleList": [
                    {
                        "order": 0,
                        "name": "base",
                        "description": "Base",
                        "class": "com.wowza.wms.module.ModuleCore"
                    },
                    {
                        "order": 1,
                        "name": "logging",
                        "description": "Client Logging",
                        "class": "com.wowza.wms.module.ModuleClientLogging"
                    },
                    {
                        "order": 2,
                        "name": "flvplayback",
                        "description": "FLVPlayback",
                        "class": "com.wowza.wms.module.ModuleFLVPlayback"
                    },
                    {
                        "order": 3,
                        "name": "ModuleCoreSecurity",
                        "description": "Core Security Module for Applications",
                        "class": "com.wowza.wms.security.ModuleCoreSecurity"
                    }
                ]
            }
        };
        dbo.collection('Clients').insertOne(myobj, (err, res) => {
            axios.post(config.WOWZACREATEAPP + folder, dado);
            handler(err, res);
        })
    },

    // inserir uma câmera em um cliente e inserir na lista do administrador
    registerCAM: (data, handler) => {
        var dbo = db.db('Users');
        var myobj = data;
        var emailAdmin = myobj.emailAdmin;
        var emailClient = myobj.emailClient;
        var resultado = emailClient.replace("@", "");
        var nomeCamera = resultado + "-" + myobj.nomeCamera;
        var descricao = myobj.descricao;
        var RTSP = myobj.RTSP;
        var quality = myobj.quality;
        quality = "720p"; // apagar esse trecho quando ser enviado a qualidade
        var myquery = { 'emailClient': emailClient };
        var myquery2 = { 'email': emailAdmin };
        var folder;
        dbo.collection('Clients').find(myquery).toArray((err, res) => {
            folder = res[0].folder;
            var newvalues2 = { $push: { "cameras": { "emailClient": emailClient, "nomeCamera": nomeCamera, "descricao": descricao, "RTSP": RTSP, "folder":folder } } };
            // Inserir Câmera no Documento Admin
            dbo.collection("Admin").updateOne(myquery2, newvalues2, function (err, res) {
                if (!err) {
                    console.log('Camera cadastrada na tabela Admin');
                }
                else {
                    console.log('Erro ao registrar câmera na tabela Administrador');
                }
            });

            var newvalues = { $push: { "cameras": { "nomeCamera": nomeCamera, "descricao": descricao, "RTSP": RTSP, "quality": quality, "folder":folder } } };
           
            // inserir Câmera no Documento Client
            dbo.collection("Clients").updateOne(myquery, newvalues, function (err, res) {
                if (!err) {
                    axios.post(ipAddCam.WOWZAADDCAM + folder + "/streamfiles", {
                        "name": nomeCamera,
                        "serverName": folder,
                        "uri": RTSP
                    })
                        .then((res) => {
                            setTimeout(function () {
                                axios.put(ipAddCam.WOWZAINICIALIZECAM + folder + "/streamfiles/" + nomeCamera + '/actions/connect?connectAppName=' + folder + '&appInstance=_definst_&mediaCasterType=rtp', {});
                                var urlExt = "http://186.250.8.96:8087/v2/servers/_defaultServer_/vhosts/_defaultVHost_/applications/" + folder + "/instances/_definst_/streamrecorders/" + nomeCamera + ".stream_" + quality;
                                var urlIn = "http://localhost:8087/v2/servers/_defaultServer_/vhosts/_defaultVHost_/applications/" + folder + "/instances/_definst_/streamrecorders/" + nomeCamera + ".stream_" + quality;
                                var records = {
                                    "restURI": urlIn,
                                    "recorderName": nomeCamera + ".stream_" + quality,
                                    "instanceName": "_definst_",
                                    "recorderState": "Waiting for stream",
                                    "defaultRecorder": true,
                                    "segmentationType": "SegmentByDuration",
                                    "baseFile": nomeCamera + ".mp4",
                                    "fileFormat": "MP4",
                                    "fileVersionDelegateName": "com.wowza.wms.livestreamrecord.manager.StreamRecorderFileVersionDelegate",
                                    "fileTemplate": "${BaseFileName}_${SegmentTime}_${SegmentNumber}",
                                    "segmentDuration": 600000,
                                    "segmentSize": 10485760,
                                    "segmentSchedule": "0 * * * * *",
                                    "recordData": true,
                                    "startOnKeyFrame": true,
                                    "option": "Version existing file",
                                    "moveFirstVideoFrameToZero": true,
                                    "currentSize": 0,
                                    "currentDuration": 0,
                                    "recordingStartTime": ""
                                };
                                axios.post(urlExt, records).then(function (response) {
                                    handler(err, res);
                                });

                            }, 1000);

                            //busca listas de ordem das câmeras
                            dbo.collection('Clients').findOne(myquery, (err, res) => {
                                if (res) {
                                    if (res.orderCameras) {
                                        if (res.orderCameras.ordemPrincipal) {
                                            let ordemPrincipal = res.orderCameras.ordemPrincipal;
                                            ordemPrincipal.push(nomeCamera);
                                            var values = { $set: { "orderCameras.ordemPrincipal": ordemPrincipal } };
                                            dbo.collection("Clients").updateOne(myquery, values, function (err, res) {

                                            });
                                        }
                                        if (res.orderCameras.orderSecond) {
                                            let orderSecond = res.orderCameras.orderSecond;
                                            orderSecond.push(nomeCamera);
                                            var values = { $set: { "orderCameras.orderSecond": orderSecond } };
                                            dbo.collection("Clients").updateOne(myquery, values, function (err, res) {

                                            });
                                        }
                                    }
                                }
                            });
                        })
                        .catch((error) => {
                            console.error(error)
                        })
                }
            });
        });
    },

    // Consulta Voltada para procurar uma câmera no admin
    consultaCameraAdmin: (data, handler) => {
        var dbo = db.db('Users');
        var myobj = data;
        dbo.collection('Admin').find(myobj).toArray((err, res) => {
            handler(err, res);
        });
    },

    // Consulta Voltada para procurar uma câmera no admin usando RTSP
    consultaCameraAdminRTSP: (data, handler) => {
        var dbo = db.db('Users');
        var myobj = data;
        var rtsp = myobj.rtsp;
        var myquery = { cameras: { $elemMatch: { RTSP: rtsp } } }
        dbo.collection("Admin").find(myquery).toArray((err, res) => {
            handler(err, res);
        });
    },

    // Consulta Voltada para procurar uma câmera no admin usando nome e email
    consultaCameraAdminName: (data, handler) => {
        var dbo = db.db('Users');
        var myobj = data;
        var nomeCamera = myobj.nomeCamera;
        var myquery = { cameras: { $elemMatch: { nomeCamera: nomeCamera } } };
        dbo.collection("Admin").find(myquery).toArray((err, res) => {
            handler(err, res);
        });
    },

    // Consulta Voltada para procurar um grupo no admin usando nome e email
    consultaGrupoName: (data, handler) => {
        var dbo = db.db('Users');
        var myobj = data;
        var nomeGrupo = myobj.nomeGrupo;
        var emailAdmin = myobj.emailAdmin;
        var myquery = { grupos: { $elemMatch: { nomeGrupo: nomeGrupo } }, email:emailAdmin };
        console.log(myquery);
        dbo.collection("Admin").find(myquery).toArray((err, res) => {
            handler(err, res);
        });
    },

    // Função responsável por editar Câmeras -> 
    editaCamera: (data, handler) => {
        var dbo = db.db('Users');
        var myobj = data;
        var myquery = { emailClient: myobj.emailClient };
        var newvalues = {
            $set:
            {
                "cameras": {
                    emailClient: myobj.emailClient,
                    nomeCamera: myobj.nomeCamera,
                    descricao: myobj.descricao,
                    RTSP: myobj.RTSP,
                }
            }
        };
        dbo.collection("Client").updateMany(myquery, newvalues, (err, res) => {
            handler(err, res);

        });
    },

    //Função responsável por deletar uma câmera do usuário, é obrigatório enviar o nome de usuário e a câmera que será deletada
    deleteCAM: (data, handler) => {
        try{
        var dbo = db.db('Users');
        var myobj = data;
        var emailAdmin = myobj.emailAdmin;
        var emailClient = myobj.emailClient;
        var nomeCamera = myobj.nomeCamera;
        var myquery = { 'emailClient': emailClient };
        var myquery2 = { 'email': emailAdmin };
        var newvalues = { $pull: { "cameras": { "nomeCamera": nomeCamera } } };
        var myquery3 = { 'email': emailAdmin, 'cameras.nomeCamera': nomeCamera };
        //Buscar o perfil do admin para procurar os grupos em que a câmera estava
        dbo.collection("Admin").findOne(myquery3, function (err, res) {
            if (res.cameras) {
                for (var i = 0; i < res.cameras.length; i++) {
                    if (res.cameras[i].nomeCamera == nomeCamera) {
                        console.log(res.cameras[i]);
                        if (res.cameras[i].grupos) {
                            let client = res;
                            let grupos = res.cameras[i].grupos;
                            for (var j = 0; j < grupos.length; j++) {
                                let gruposSave = grupos[j];
                                //Para cada grupo em que estava a câmera, busca-se o client, onde os grupos estão registrados
                                var myquery4 = { 'emailClient': grupos[j].clientEmail };
                                dbo.collection("Clients").findOne(myquery4, function (err, res) {
                                    if (res) {
                                        if (res.acessoCamera) {
                                            for (var k = 0; k < res.acessoCamera.length; k++) {
                                                //Procura qual o grupo que a câmera digitada estava
                                                if (res.acessoCamera[k].nomeGrupo === gruposSave.nameGroup) {
                                                    let selectedGroup = res.acessoCamera[k];
                                                    var index;
                                                    //Procura o index dentro do array de câmeras para deletar
                                                    selectedGroup.cameras.forEach(function (value, i) {
                                                        if (value.nomeCamera === nomeCamera) {
                                                            index = i;
                                                        }
                                                    });
                                                    selectedGroup.cameras.splice(index, 1);
                                                    let myquery5 = { 'emailClient': gruposSave.clientEmail, 'acessoCamera.nomeGrupo': gruposSave.nameGroup };
                                                    let values2 = { $set: { "acessoCamera.$.cameras": selectedGroup.cameras } };
                                                    if (selectedGroup.order) {
                                                        //Caso o grupo tenha uma ordem já definida, deleta também a câmera dessa ordem
                                                        selectedGroup.order.forEach(function (value, i) {
                                                            if (value === nomeCamera) {
                                                                index = i;
                                                            }
                                                        });
                                                        selectedGroup.order.splice(index, 1);
                                                        values2 = { $set: { "acessoCamera.$.cameras": selectedGroup.cameras, "acessoCamera.$.order": selectedGroup.order } };
                                                    }
                                                    dbo.collection("Clients").updateMany(myquery5, values2, function (err, res) {

                                                    });
                                                    //Deleta também a câmera das ordens (layout-1 e grupos, pois usam câmeras compartilhadas). Utilizado para câmeras que não pertenciam ao cliente utilizando
                                                    if (res.orderCameras) {
                                                        if (res.orderCameras.orderGroup) {
                                                            index = null;
                                                            let orderGroup = res.orderCameras.orderGroup;
                                                            orderGroup.forEach(function (value, i) {
                                                                if (value === nomeCamera) {
                                                                    index = i;
                                                                }
                                                            });
                                                            if (index != null) {
                                                                orderGroup.splice(index, 1);
                                                                var values3 = { $set: { "orderCameras.orderGroup": orderGroup } };
                                                                dbo.collection("Clients").updateMany(myquery5, values3, function (err, res) {

                                                                });
                                                            }
                                                        }
                                                        if (res.orderCameras.ordemPrincipal) {
                                                            let ordemPrincipal = res.orderCameras.ordemPrincipal;
                                                            index = null;
                                                            ordemPrincipal.forEach(function (value, i) {
                                                                if (value === nomeCamera) {
                                                                    index = i;
                                                                }
                                                            });
                                                            if (index != null) {
                                                                ordemPrincipal.splice(index, 1);
                                                                var values3 = { $set: { "orderCameras.ordemPrincipal": ordemPrincipal } };
                                                                dbo.collection("Clients").updateMany(myquery5, values3, function (err, res) {

                                                                });
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                });
                            }
                        }
                    }
                }
            }
            dbo.collection("Clients").updateOne(myquery, newvalues, function (err, res) {
                dbo.collection("Admin").updateOne(myquery2, newvalues, function (err, res) {
                    //Busca o cliente dono das câmeras e deleta ela de sua própria lista de ordens
                    dbo.collection('Clients').findOne(myquery, (err, res) => {
                        let index;
                        let folder = res.folder;
                        var quality = "720p";
                        var endereco1 = ipAddCam.WOWZADELETECAM + folder + "/streamfiles/" + nomeCamera;
                        var endereco2 = ipAddCam.WOWZASTOPSTREAM + folder + "/instances/_definst_/incomingstreams/" + nomeCamera + ".stream/" + "actions/disconnectStream";
                        var endereco3 = ipAddCam.WOWZASTOPRECORD + folder + "/instances/_definst_/streamrecorders/" + nomeCamera + ".stream_" + quality + "/actions/stopRecording";
                        console.log(endereco3);
                        axios.put(endereco2, {});
                        axios.put(endereco3, {});
                        setTimeout(function () {
                            axios.delete(endereco1, {});
                        }, 2000);
                        if (res) {
                            if (res.orderCameras) {
                                if (res.orderCameras.ordemPrincipal) {
                                    let ordemPrincipal = res.orderCameras.ordemPrincipal;
                                    index = null;
                                    ordemPrincipal.forEach(function (value, i) {
                                        if (value === nomeCamera) {
                                            index = i;
                                        }
                                    });
                                    if (index != null) {
                                        ordemPrincipal.splice(index, 1);
                                        var values = { $set: { "orderCameras.ordemPrincipal": ordemPrincipal } };
                                        dbo.collection("Clients").updateMany(myquery, values, function (err, res) {

                                        });
                                    }
                                }
                                if (res.orderCameras.orderSecond) {
                                    let orderSecond = res.orderCameras.orderSecond;
                                    index = null
                                    orderSecond.forEach(function (value, i) {
                                        if (value === nomeCamera) {
                                            index = i;
                                        }
                                    });
                                    if (index != null) {
                                        orderSecond.splice(index, 1);
                                        var values = { $set: { "orderCameras.orderSecond": orderSecond } };
                                        dbo.collection("Clients").updateMany(myquery, values, function (err, res) {

                                        });
                                    }
                                }
                                if (res.orderCameras.orderGroup) {
                                    let orderGroup = res.orderCameras.orderGroup;
                                    index = null;
                                    orderGroup.forEach(function (value, i) {
                                        if (value === nomeCamera) {
                                            index = i;
                                        }
                                    });
                                    if (index != null) {
                                        orderGroup.splice(index, 1);
                                        var values = { $set: { "orderCameras.orderGroup": orderGroup } };
                                        dbo.collection("Clients").updateMany(myquery, values, function (err, res) {

                                        });
                                    }
                                }
                            }
                        }
                        handler(err, res);
                    })
                });
            });
        });
    }catch(error){
        console.log(error);
    }
    },


    updateClient: (data, handler) => {
        var dbo = db.db('Users');
        var myobj = data;
        var myquery = { emailClient: myobj.emailClientAntigo };
        var passwordNew;
        dbo.collection('Clients').findOne(myquery, (err, res) => {
            if(myobj.password === res.password)
            {
                passwordNew = res.password;
            }
            else{
                passwordNew = bcrypt.hashSync(myobj.password, config.SALT_ROUNDS);
            }
            var newvalues = {
                $set:
                {
                    nomeClient: myobj.nomeClient,
                    emailClient: myobj.emailClient,
                    password: passwordNew,
                    nomeEmnpresa: myobj.nomeEmpresa,
                    CNPJouCPF: myobj.CNPJouCPF,
                    sobreNomeClient: myobj.sobreNomeClient,
                    endereco: myobj.endereco,
                    cidade: myobj.cidade,
                    estado: myobj.estado,
                    CEP: myobj.CEP,
                }
            };
            dbo.collection("Clients").updateMany(myquery, newvalues, (err, res) => {
                handler(err, res);
            }); 
        });
    },

    deleteClient: (data, handler) => {
        var dbo = db.db('Users');
        var myobj = data;
        var myquery = { emailClient: myobj.emailClient };
        
        dbo.collection('Clients').find(myquery).toArray((err, res) => {
            try {
                var folder = res[0].folder;
                var emailAdmin = res[0].emailAdmin;
                var myquery3 = { 'emailAdmin': emailAdmin};
                var newvalues3 = { $set: {'cameras.$.emailClient': myobj.emailClient }};
                dbo.collection("Admin").updateMany(myquery3, newvalues3, (err, res) => {
                });
                if(folder)
                {
                    var dir = config.ADDRESSFOLDER + folder;
                    rimraf(dir, function () { console.log("done"); });
                    axios.delete(config.DELETEAPLICATION + folder, {});
                }
                dbo.collection("Clients").deleteOne(myquery, (err, res) => {
                    handler(err, res);
                })
            }
            catch (err) {
                handler(err, res);
            }
        });
    },

    deleteAdmin: (data, handler) => {
        var dbo = db.db('Users');
        var myobj = data;
        var myquery = { email: myobj.email };
        dbo.collection("Admin").deleteOne(myquery, (err, res) => {
            handler(err, res);
        });
    },

    addGrupo: (data, handler) => {
        var dbo = db.db('Users');
        var myobj = data;
        var nomeGrupo = myobj.nomeGrupo;
        var emailClients = myobj.grupoUsers;
        var cameras = myobj.grupoCameras;
        var emailAdmin = myobj.emailAdmin;
        var error;
        var response;
        for (var i = 0; i < emailClients.length; i++) {
            var myquery = { 'emailClient': emailClients[i] };
            var newvalues = { $push: { "acessoCamera": { "nomeGrupo": nomeGrupo, "cameras": cameras } } };
            dbo.collection("Clients").updateMany(myquery, newvalues, function (err, res) {
                error = err;
                response = res;
            });
        }
        for (var i = 0; i < emailClients.length; i++) {
            for (var j = 0; j < cameras.length; j++) {
                var myquery = { 'email': emailAdmin, 'cameras.nomeCamera': cameras[j].nomeCamera };
                let group = {};
                group["nameGroup"] = nomeGrupo;
                group["clientEmail"] = emailClients[i];
                var values = { $push: { "cameras.$.grupos": group } };
                dbo.collection("Admin").updateOne(myquery, values, function (err, res) {

                });
            }
        }
        //Adiciona um grupo no perfil admin para controle
        var adminSave = { $push: { "grupos": {'nomeGrupo':nomeGrupo, 'users':emailClients}}};
        var adminQuery = {'email':emailAdmin};
        dbo.collection("Admin").updateMany(adminQuery, adminSave, function (err, res) {
            
        });
        handler(error, response);
    },

    addClientGrupo: (data,handler) => {
        var dbo = db.db('Users');
        var myobj = data;
        let grupo = myobj.grupoSelected;
        let emailAdmin = myobj.emailAdmin;
        let emailClients = myobj.emailClients;
        let exist;
        var error;
        var response;
        emailClients.forEach(function (client, i) {
            if(client){
                var myquery = { 'emailClient': client.emailClient };
                grupo.cameras.forEach(function(camera,j){
                    if(client.orderCameras){
                        if(client.orderCameras.ordemPrincipal){
                            exist = 0;
                            client.orderCameras.ordemPrincipal.forEach(function (ordem, j){
                                if(ordem===camera.nomeCamera){
                                    exist++
                                }
                            });
                            if(exist===0){
                                client.orderCameras.ordemPrincipal.push(camera.nomeCamera);
                            }
                        }
                        if(client.orderCameras.orderGroup){
                            exist = 0;
                            client.orderCameras.orderGroup.forEach(function (ordem, j){
                                if(ordem===camera.nomeCamera){
                                    exist++
                                }
                            });
                            if(exist===0){
                                client.orderCameras.orderGroup.push(camera.nomeCamera);
                            }
                        }
                    }
                });
                if(client.orderCameras){
                    if(client.orderCameras.ordemPrincipal){
                        var valuesPrincipal = { $set: { "orderCameras.ordemPrincipal": client.orderCameras.ordemPrincipal } };
                        dbo.collection("Clients").updateMany(myquery, valuesPrincipal, function (err, res) {

                        });
                    }
                }
                if(client.orderCameras){
                    if(client.orderCameras.orderGroup){
                        var valuesGroup = { $set: { "orderCameras.orderGroup": client.orderCameras.orderGroup } };
                        dbo.collection("Clients").updateMany(myquery, valuesGroup, function (err, res) {

                        });
                    }
                }
                var newvalues = { $push: { "acessoCamera": { "nomeGrupo": grupo.nomeGrupo, "cameras": grupo.cameras } } };
                dbo.collection("Clients").updateMany(myquery, newvalues, function (err, res) {
                    console.log(err);
                });
                grupo.users.push(client.emailClient);
            }
        });
        var adminQuery = { 'email': emailAdmin, 'grupos.nomeGrupo': grupo.nomeGrupo };
        var valuesAdmin = { $set: { "grupos.$.users": grupo.users } };
        dbo.collection("Admin").updateOne(adminQuery, valuesAdmin, function (err, res) {
            error = err;
            response = res;
        });
        handler(error, response);
    },

    deleteClientGrupo: (data,handler) => {
        var dbo = db.db('Users');
        var myobj = data;
        let grupo = myobj.grupoSelected;
        let emailAdmin = myobj.emailAdmin;
        let emailClient = myobj.emailClient;
        let exist;
        let existGroup;
        let index;
        var error;
        var response;
        let client;
        var myquery = { 'emailClient': emailClient };
        dbo.collection("Clients").findOne(myquery, function (err, res) {
            if (res) {
                client = res;
                if(grupo.cameras){
                    grupo.cameras.forEach(function(camera,j){
                        exist = 0;
                        if(client.acessoCamera){
                            client.acessoCamera.forEach(function(grupo){
                                grupo.cameras.forEach(function(cameraGrupo){
                                    if(camera.nomeCamera===cameraGrupo.nomeCamera){
                                        exist++;
                                    }
                                })
                            });
                        }
                        client.cameras.forEach(function(cameraClient){
                            if(cameraClient.nomeCamera===camera.nomeCamera){
                                exist++;
                            }
                        });
                        if(exist===1){
                            if(client.orderCameras){
                                if(client.orderCameras.ordemPrincipal){
                                    index = null;
                                    existGroup = 0;
                                    client.orderCameras.ordemPrincipal.forEach(function (ordem, j){
                                        if(ordem===camera.nomeCamera){
                                            existGroup++;
                                            index=j;
                                        }
                                    });
                                    if(existGroup>0){
                                        client.orderCameras.ordemPrincipal.splice(index,1);
                                    }
                                }
                                if(client.orderCameras.orderGroup){
                                    index = null;
                                    existGroup = 0;
                                    client.orderCameras.orderGroup.forEach(function (ordem, j){
                                        if(ordem===camera.nomeCamera){
                                            existGroup++;
                                            index = j;
                                        }
                                    });
                                    if(existGroup>0){
                                        client.orderCameras.orderGroup.splice(index,1);
                                    }
                                }
                            }
                        }
                    });
                    if(client.orderCameras){
                        if(client.orderCameras.ordemPrincipal){
                            var valuesPrincipal = { $set: { "orderCameras.ordemPrincipal": client.orderCameras.ordemPrincipal } };
                            dbo.collection("Clients").updateMany(myquery, valuesPrincipal, function (err, res) {
            
                            });
                        }
                    }
                    if(client.orderCameras){
                        if(client.orderCameras.orderGroup){
                            var valuesGroup = { $set: { "orderCameras.orderGroup": client.orderCameras.orderGroup } };
                            dbo.collection("Clients").updateMany(myquery, valuesGroup, function (err, res) {
            
                            });
                        }
                    }
                }
                index = null;
                client.acessoCamera.forEach(function (acesso, j){
                    if(acesso.nomeGrupo===grupo.nomeGrupo){
                        index = j;
                    }
                });
                client.acessoCamera.splice(index,1);
                let grupos = client.acessoCamera;
                var newvalues = { $set: { "acessoCamera": grupos  } };
                dbo.collection("Clients").updateMany(myquery, newvalues, function (err, res) {
                    
                });
            }
        });
        let indexGrupo = null;
        grupo.users.forEach(function (user, j){
            if(user==emailClient){
                indexGrupo = j;
            }
        });
        grupo.users.splice(indexGrupo,1);
        var adminQuery = { 'email': emailAdmin, 'grupos.nomeGrupo': grupo.nomeGrupo };
        var valuesAdmin = { $set: { "grupos.$.users": grupo.users } };
        dbo.collection("Admin").updateOne(adminQuery, valuesAdmin, function (err, res) {
            error = err;
            response = res;
        });
        handler(error, response);
    },

    addCameraGrupo: (data,handler) => {
        var dbo = db.db('Users');
        var myobj = data;
        let cameras = data.cameras;
        let camera;
        var error;
        var response;
        let grupo = data.grupoSelected;
        grupo.users.forEach((client,j) => {
            var myquery = { 'emailClient': client };
            let clientGrupo=null;
            dbo.collection("Clients").findOne(myquery, (err, res) => {
                if (res) {
                    client = res;
                    let newCamera;
                    let queryClient;
                    let clientValues;
                    let exist;
                    let existOrder;
                    let index;
                    cameras.forEach((camera,i) => {
                        if(camera){
                        exist = 0;
                        client.cameras.forEach(function(cameraClient){
                            if(cameraClient.nomeCamera===camera.nomeCamera){
                                exist++;
                            }
                        });
                        client.acessoCamera.forEach(function (acesso, k){
                            if(grupo.nomeGrupo===acesso.nomeGrupo){
                                clientGrupo = acesso;
                            }
                            acesso.cameras.forEach(function(cameraGrupo){
                                if(camera.nomeCamera===cameraGrupo.nomeCamera){
                                    exist++;
                                }
                            })
                        });
                        if(exist===0){
                            if(client.orderCameras){
                                if(client.orderCameras.ordemPrincipal){
                                    existOrder = 0;
                                    client.orderCameras.ordemPrincipal.forEach(function (ordem, k){
                                        if(ordem===camera.nomeCamera){
                                            existOrder++;
                                        }
                                    });
                                    if(existOrder===0){
                                        client.orderCameras.ordemPrincipal.push(camera.nomeCamera);
                                    }
                                }
                                if(client.orderCameras.orderGroup){
                                    existOrder = 0;
                                    client.orderCameras.orderGroup.forEach(function (ordem, k){
                                        if(ordem===camera.nomeCamera){
                                            existOrder++;
                                        }
                                    });
                                    if(existOrder===0){
                                        client.orderCameras.orderGroup.push(camera.nomeCamera);
                                    }
                                }
                                if(clientGrupo.order){
                                    existOrder = 0;
                                    clientGrupo.order.forEach(function (ordem, k){
                                        if(ordem===camera.nomeCamera){
                                            existOrder++;
                                        }
                                    });
                                    if(existOrder===0){
                                        clientGrupo.order.push(camera.nomeCamera);
                                    }
                                }
                            }
                        }
                        newCamera = {'nomeCamera':camera.nomeCamera,'folder':camera.folder};
                        clientGrupo.cameras.push(newCamera);
                        }
                    });
                };
                if(clientGrupo!==null){
                    if(client.orderCameras){
                        if(client.orderCameras.ordemPrincipal){
                            var valuesPrincipal = { $set: { "orderCameras.ordemPrincipal": client.orderCameras.ordemPrincipal } };
                            dbo.collection("Clients").updateMany(myquery, valuesPrincipal, function (err, res) {
            
                            });
                        }
                    }
                    if(client.orderCameras){
                        if(client.orderCameras.orderGroup){
                            var valuesGroup = { $set: { "orderCameras.orderGroup": client.orderCameras.orderGroup } };
                            dbo.collection("Clients").updateMany(myquery, valuesGroup, function (err, res) {
            
                            });
                        }
                    }
                    queryClient = {'emailClient': client.emailClient, 'acessoCamera.nomeGrupo': clientGrupo.nomeGrupo};
                    if(clientGrupo.order){
                        clientValues = { $set: { "acessoCamera.$.cameras": clientGrupo.cameras, "acessoCamera.$.order": clientGrupo.order } };
                    }else{
                        clientValues = { $set: { "acessoCamera.$.cameras": clientGrupo.cameras } };
                    }
                    dbo.collection("Clients").updateMany(queryClient, clientValues, function (err, res) {
                        error = err;
                        response = res;
                    });
                }
            });
        });
        handler(error, response);
    },

    deleteCameraGrupo: (data,handler) => {
        var dbo = db.db('Users');
        var myobj = data;
        let camera = data.camera;
        var error;
        var response;
        let grupo = data.grupoSelected;
        let clientGrupo=null;
        let has;
        grupo.users.forEach((client,j) => {
            let index;
            let existOrder;
            var myquery = { 'emailClient': client };
            dbo.collection("Clients").findOne(myquery, (err, res) => {
                if (res) {
                    client = res;
                    exist = 0;
                    has = false;
                    client.cameras.forEach(function(cameraClient){
                        if(cameraClient.nomeCamera===camera.nomeCamera){
                            has = true;
                        }
                    });
                    client.acessoCamera.forEach(function (acesso, k){
                        if(grupo.nomeGrupo===acesso.nomeGrupo){
                            clientGrupo = acesso;
                        }
                        if(has===false){
                            acesso.cameras.forEach(function(cameraGrupo){
                                if(camera.nomeCamera===cameraGrupo.nomeCamera){
                                    exist++;
                                }
                            })
                        }
                    });
                    index = null;
                    existOrder = 0;
                    clientGrupo.cameras.forEach(function (cameraGrupo, k){
                        if(cameraGrupo.nomeCamera===camera.nomeCamera){
                            existOrder++;
                            index = k;
                        }
                    });
                    if(existOrder===1){
                        clientGrupo.cameras.splice(index,1);
                    }
                    index = null;
                    if(clientGrupo.order){
                        existOrder = 0;
                        clientGrupo.order.forEach(function (ordem, k){
                            if(ordem===camera.nomeCamera){
                                existOrder++;
                                index = k;
                            }
                        });
                        if(existOrder===1){
                            clientGrupo.order.splice(index,1);
                        }
                    }
                    if(exist===1){
                        index = null;
                        if(client.orderCameras){
                            if(client.orderCameras.ordemPrincipal){
                                existOrder = 0;
                                client.orderCameras.ordemPrincipal.forEach(function (ordem, k){
                                    if(ordem===camera.nomeCamera){
                                        existOrder++;
                                        index = k;
                                    }
                                });
                                if(existOrder===1){
                                    client.orderCameras.ordemPrincipal.splice(index,1);
                                }
                            }
                            index = null;
                            if(client.orderCameras.orderGroup){
                                existOrder = 0;
                                client.orderCameras.orderGroup.forEach(function (ordem, k){
                                    if(ordem===camera.nomeCamera){
                                        existOrder++;
                                        index = k;
                                    }
                                });
                                if(existOrder===1){
                                    client.orderCameras.orderGroup.splice(index,1);
                                }
                            }
                            if(client.orderCameras){
                                if(client.orderCameras.ordemPrincipal){
                                    var valuesPrincipal = { $set: { "orderCameras.ordemPrincipal": client.orderCameras.ordemPrincipal } };
                                    dbo.collection("Clients").updateMany(myquery, valuesPrincipal, function (err, res) {
                    
                                    });
                                }
                            }
                            if(client.orderCameras){
                                if(client.orderCameras.orderGroup){
                                    var valuesGroup = { $set: { "orderCameras.orderGroup": client.orderCameras.orderGroup } };
                                    dbo.collection("Clients").updateMany(myquery, valuesGroup, function (err, res) {
                    
                                    });
                                }
                            }
                        }
                    }
                    queryClient = {'emailClient': client.emailClient, 'acessoCamera.nomeGrupo': clientGrupo.nomeGrupo};
                    if(clientGrupo.order){
                        clientValues = { $set: { "acessoCamera.$.cameras": clientGrupo.cameras, "acessoCamera.$.order": clientGrupo.order } };
                    }else{
                        clientValues = { $set: { "acessoCamera.$.cameras": clientGrupo.cameras } };
                    }
                    dbo.collection("Clients").updateMany(queryClient, clientValues, function (err, res) {
                        error = err;
                        response = res;
                    });
                }
            });
        });
        handler(error, response);
    },

    deleteGrupo: (data, handler) => {
        var dbo = db.db('Users');
        var myobj = data;
        let grupo = myobj.grupo;
        let emailAdmin = myobj.emailAdmin;
        var error;
        var response;
        let index;
        let grupoSelected;
        let acessoCamera;
        for (var i = 0; i < grupo.users.length; i++) {
            var myquery = { 'emailClient': grupo.users[i]};
            //busca cada cliente para deletar as ordens e grupos
            dbo.collection('Clients').findOne(myquery, (err, res) => {
                let client = res;
                var myquery = { 'emailClient': client.emailClient };
                if(client.acessoCamera){
                    index = null;
                    acessoCamera = client.acessoCamera;
                    client.acessoCamera.forEach(function (value, i) {
                        if(value.nomeGrupo == grupo.nomeGrupo){
                            grupoSelected = value;
                            index = i;
                        }
                    });
                    if(index!==null){
                        acessoCamera.splice(index, 1);
                        var valuesAcesso = { $set: { "acessoCamera": acessoCamera } };
                        dbo.collection("Clients").updateMany(myquery, valuesAcesso, function (err, res) {

                        });
                    }
                    grupoSelected.cameras.forEach(function (camera, i) {
                        //deleta de ordergroup
                        if(res.orderCameras){
                            if (res.orderCameras.orderGroup) {
                                let orderGroup = client.orderCameras.orderGroup;
                                index = null;
                                orderGroup.forEach(function (value, i) {
                                    if (value === camera.nomeCamera) {
                                        index = i;
                                    }
                                });
                                if (index != null) {
                                    orderGroup.splice(index, 1);
                                    var values = { $set: { "orderCameras.orderGroup": orderGroup } };
                                    dbo.collection("Clients").updateMany(myquery, values, function (err, res) {

                                    });
                                }
                            }
                            if(camera.folder !== client.folder){
                                if (res.orderCameras.ordemPrincipal) {
                                    let ordemPrincipal = client.orderCameras.ordemPrincipal;
                                    index = null;
                                    ordemPrincipal.forEach(function (value, i) {
                                        if (value === camera.nomeCamera) {
                                            index = i;
                                        }
                                    });
                                    if (index != null) {
                                        ordemPrincipal.splice(index, 1);
                                        var valuesPrincipal = { $set: { "orderCameras.ordemPrincipal": ordemPrincipal } };
                                        dbo.collection("Clients").updateMany(myquery, valuesPrincipal, function (err, res) {

                                        });
                                    }
                                }
                            }
                        }
                    });
                }
            });
        }
        adminQuery = { 'email': emailAdmin };
        dbo.collection('Admin').findOne(adminQuery, (err, res) => {
            index = null;
            let gruposAdmin = res.grupos;
            gruposAdmin.forEach(function (value, i) {
                if(value.nomeGrupo == grupo.nomeGrupo){
                    index = i;
                }
            });
            if(index!==null){
                gruposAdmin.splice(index, 1);
                let valueAdmin = { $set: { "grupos": gruposAdmin } };
                dbo.collection("Admin").updateMany(adminQuery, valueAdmin, function (err, res) {

                });
            }
        });
        handler(error, response);
    },


    //procurar todos os seus clientes (voltado para o Admin)
    findCam: (data, handler) => {
        var dbo = db.db('Users');
        var myobj = data;
        dbo.collection('Clients').find(myobj).toArray((err, res) => {
            handler(err, res);
        });
    },

    //procurar todos os seus clientes (voltado para o Admin)
    findAllClients: (data, handler) => {
        var dbo = db.db('Users');
        dbo.collection('Clients').find({}).toArray((err, res) => {
            handler(err, res);
        });
    },

    findAllAdmin: (data, handler) => {
        var dbo = db.db('Users');
        dbo.collection('Admin').find({}).toArray((err, res) => {
            handler(err, res);
        });
    },

    //procurar todos os seus clientes (voltado para o Admin)
    findProfileAdmin: (data, handler) => {
        var dbo = db.db('Users');
        var myobj = data;
        dbo.collection('Admin').find(myobj).toArray((err, res) => {
            handler(err, res);
        });
    },

    updateAdmin: (data, handler) => {
        var dbo = db.db('Users');
        var myobj = data;
        var myquery = { email: myobj.emailClientAntigo };
        var newvalues = {
            $set:
            {
                nome: myobj.nome,
                email: myobj.email,
                password: myobj.password,
                razaosocial: myobj.razaosocial,
                CNPJouCPF: myobj.CNPJouCPF,
                sobrenome: myobj.sobrenome,
                endereco: myobj.endereco,
                cidade: myobj.cidade,
                estado: myobj.estado,
                CEP: myobj.CEP,
            }
        };
        dbo.collection("Admin").updateMany(myquery, newvalues, (err, res) => {
            handler(err, res);
        });
    },

    // registar uma ordem no banco cliente
    registerOrderCam: (data, handler) => {
        var dbo = db.db('Users');
        var myobj = data;
        var emailClient = myobj.emailClient;
        var ordercam = myobj.orderCameras;
        var myquery = { 'emailClient': emailClient };
        if (myobj.layout === "layout-1") {
            var values = { $set: { "orderCameras.ordemPrincipal": ordercam } };
        } else if (myobj.layout === "layout-2") {
            var values = { $set: { "orderCameras.orderSecond": ordercam } };
        }
        dbo.collection("Clients").updateOne(myquery, values, function (err, res) {
            handler(err, res);
        });
    },

    // buscar dados 
    findOrderCam: (data, handler) => {
        var dbo = db.db('Users');
        var myobj = data;
        dbo.collection('Clients').find(myobj).toArray((err, res) => {
            handler(err, res);
        });
    },

    insertordergroup: (data, handler) => {
        var dbo = db.db('Users');
        var myobj = data;
        var emailClient = myobj.emailClient;
        var nameGroup = myobj.nameGroup;
        var ordercam = myobj.orderCameras;
        if (nameGroup !== "Todos os Grupos") {
            var myquery = { 'emailClient': emailClient, 'acessoCamera.nomeGrupo': nameGroup };
            var values = { $set: { "acessoCamera.$.order": ordercam } };
        } else {
            var myquery = { 'emailClient': emailClient };
            var values = { $set: { "orderCameras.orderGroup": ordercam } };
        }
        dbo.collection("Clients").updateOne(myquery, values, function (err, res) {
            handler(err, res);
        });
    },

    findProfileMaster: (data, handler) => {
        var dbo = db.db('Users');
        var myobj = data;
        dbo.collection('Super').find(myobj).toArray((err, res) => {
            handler(err, res);
        });
    }


}
