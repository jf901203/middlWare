var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var multer=require('multer');
var mongoose=require('mongoose');
// http解析请求体得中间件
// 经过这个中间件处理后，就可以在所有路由处理器的req.body中访问请求参数
// 针对post处理请求的中间件 把post请求的数据拿到放到req请求层、
// 解析post请求的中间件
var bodyParser = require('body-parser');
var app = express();
var session = require('express-session');

global.dbHandel=require('./database/dbHandel');
global.db=mongoose.connect('mongodb://localhost:27017/nodedb',{ useNewUrlParser: true });

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

// 服务器端会创建一个 session 对象，生成一个类似于key,value 的键值对
app.use(session({  
  resave: false,  
  saveUninitialized: true,  
  cookie: {maxAge:3600000},  
  secret: 'secret'
}));  

// 解析 json数据的解析 所有的post的请求都会经过bodyParser中间件
app.use(bodyParser.json());	
// 解析 application/x-www-form-urlencoded  form表单数据的解析
app.use(bodyParser.urlencoded({ extended: true }));


// 设置模板路径
app.set('views', path.join(__dirname, 'views'));
// 设置模板
app.engine("html",require("ejs").__express);
// 设置模板引擎
app.set('view engine', 'html');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



// 所有理由都经过这个中间件
app.use(function(req,res,next){ 
  res.locals.user = req.session.user;   // 从session 获取 user对象
  var err = req.session.error;   //获取错误信息
  delete req.session.error;
  res.locals.message = "";   // 展示的信息 message
  if(err){ 
      res.locals.message = '<div class="alert alert-danger" style="margin-bottom:20px;color:red;">'+err+'</div>';
  }
  next();  //中间件传递
});



app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/login', indexRouter);
app.use('/register', indexRouter);
app.use('/home', indexRouter);
app.use('/logout', indexRouter);

// 请求都没有匹配上的话就执行最后一个中间件
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
