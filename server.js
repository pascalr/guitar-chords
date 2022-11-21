import createError from 'http-errors';
import express from 'express';
import path from 'path';
import logger from 'morgan';
import { fileURLToPath } from 'url';
import http from 'http';
import debugModule from 'debug';
import fs from 'fs';
const debug = debugModule('todos:server');
//import _ from 'lodash';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

var app = express();

// view engine setup
app.set('views', path.join(path.join(__dirname, '..'), 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', function(req, res, next) {
  res.send('Hello world!')
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {

  //if (req.app.get('env') === 'development') {
  if (process.env.NODE_ENV == "development") {

    if (typeof err === 'string') {
      res.locals.message = err;
      res.locals.error = {};
    } else {
      res.locals.message = err.message;
      res.locals.error = err;
    }

    // render the error page
    res.status(err.status || 500);
    res.render('error_dev');

  } else {
    console.log('ERROR', err)
    res.redirect('/error');
  }
});

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

var server = http.createServer(app);
// Listen on provided port, on all network interfaces.
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    return val; // named pipe
  }

  if (port >= 0) {
    return port; // port number
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
