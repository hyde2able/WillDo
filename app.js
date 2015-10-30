var express = require('express')
  , http = require('http')
  , path = require('path')
  , app = express()
  , favicon = require('serve-favicon')
  , logger = require('morgan')
  , cookieParser = require('cookie-parser')
  , bodyParser = require('body-parser')
  , session = require('express-session')
  , flash = require('connect-flash');

var routes = require('./routes/index')
  , sessionStore = new session.MemoryStore;


////////////////////////////// app setup //////////////////////////////////////////////////

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser('secret'));
app.use(session({ cookie: { maxAge: 60000 },  store: sessionStore,  saveUninitialized: true,  resave: 'true',  secret: 'secret' }));
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));
// ルート設定
app.use('/', routes);
app.use(function(req, res, next) {
  res.locals.flash = req.flash();
  next();
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


// createServerの返り値を変数に入れる。
var server = http.createServer(app);
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// socket.ioのモジュールを読み込み、bbsのモジュールにsocketを渡しておく。
var io = require('socket.io');
var io = io.listen(server);

// io.socketsは接続された全てのsocketを指します。
// on('connection')で接続した時のアクションを登録します。
// ここでは、接続したsocketを受け取り、bbs.message関数に渡します。
io.sockets.on('connection', function(socket) {
  console.log('つながったよ');
  routes.message(socket);
});



module.exports = app;
