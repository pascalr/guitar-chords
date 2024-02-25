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

import { enableLiveReload } from './src/livereload.js';
import { compileSvelte } from './src/compile.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let songs = fs.readdirSync(path.join(__dirname, 'views', 'chords'));

var app = express();

compileSvelte();

enableLiveReload(app)

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.locals.locale = 'en'
app.locals.songs = songs

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'docs')));

app.get('/test', function(req, res, next) {
  res.render('test')
})

app.get('/', function(req, res, next) {
  app.locals.gon = {songs}
  res.render('index')
})

app.get('/c/:song', function(req, res, next) {
  // FIXME: Unsafe, but anyway this website is never meant to be showed live, only cached.
  fs.readFile(path.join('views', 'chords', req.params.song), 'utf8', function (err,data) {
    if (err) {
      console.log(err);
      next('Error reading song file...')
    } else {
      res.locals.title = req.params.song
      res.locals.song = data
      res.render('song')
    }
  });
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {

  if (typeof err === 'string') {
    res.locals.message = err;
    res.locals.error = {};
  } else {
    res.locals.message = err.message;
    res.locals.error = err;
  }

  // render the error page
  res.status(err.status || 500);
  res.render('error');
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
