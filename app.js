var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var mongoose = require('mongoose');
require('./passport');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var fileRouter = require('./routes/file');
var productRouter = require('./routes/product');

// ============== FOR USER ============== //
var authRouter = require('./routes/auth');
var notificationRouter = require('./routes/notification');
var reviewRouter = require('./routes/review');
var addtocartRouter = require('./routes/AddToCart');
var wishlistRouter = require('./routes/Wishlist');
var orderRouter = require('./routes/order');

var dotenv = require('dotenv');
const passport = require('passport');
const MongoStore = require('connect-mongo').MongoStore;
var app = express();

dotenv.config();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('DataBase Connect Successfully✅'))
  .catch((err) => console.log("Some error in the code that's why DB not connect❌", err));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'uploads')));

app.use(cors({
  origin: "http://localhost:8080",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(require('express-session')({
  secret: 'supersecretkey',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "lax",
    secure: false
  }
}));

app.use(passport.initialize());
app.use(passport.session())

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/uploadimage', fileRouter);
app.use('/product', productRouter);
app.use('/auth', authRouter);
app.use('/notifications', notificationRouter);
app.use('/review', reviewRouter);
app.use('/add-to-cart', addtocartRouter);
app.use('/wishlist', wishlistRouter);
app.use('/order', orderRouter);


app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
