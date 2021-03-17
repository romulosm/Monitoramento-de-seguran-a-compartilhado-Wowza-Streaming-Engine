var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var app = express();
var config = require('./config');

// incluir swagger
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
var options = {
  explorer: true
};
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));




// importar Rotas para uso 
var auth = require('./routes/auth');
var client = require('./routes/client');
var serverMidea = require('./routes/serverMidea');
var admin= require('./routes/admin');
var master = require('./routes/master');

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/auth', auth);
app.use('/client', client);
app.use('/servermidea', serverMidea);
app.use('/admin', admin);
app.use('/master', master)


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const ipCliente = req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
  console.log(ipCliente);
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.json("error");
});

module.exports = app;
