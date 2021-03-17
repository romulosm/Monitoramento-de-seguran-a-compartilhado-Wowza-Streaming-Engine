var axios = require('axios');
var config = require('../config');
var MongoClient = require('mongodb').MongoClient;
var bcrypt = require('bcrypt');
var md5 = require('md5');
const fs = require('fs');
var rimraf = require("rimraf");

module.exports={
    
    addClient(data, db){
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
            return res;
        })    
    
    
    }    
}
