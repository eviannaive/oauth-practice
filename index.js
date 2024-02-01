const dotenv = require('dotenv');
dotenv.config();
const express = require('express')
const app = express();
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth-routes');
const profileRoutes = require('./routes/profile-routes');
const session = require('express-session')
const passport = require('passport')
const flash = require('connect-flash')

require('./config/passport')

// 連結DB
mongoose.connect ('mongodb://127.0.0.1/googleDB').then(()=>{
  console.log('成功連結DB')
}).catch((e)=>{
  '資料庫連結失敗',e
})

// 設定middlewares以及排版引擎
app.set('view engine','ejs');
app.use(express.json());
app.use(express.urlencoded({extended: true}))
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false
  }
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.use((req,res,next)=>{
  // res.locals設定的值可以直接在ejs中做使用,詳message.ejs
  res.locals.success_msg = req.flash('success_msg')
  res.locals.error_msg = req.flash('error_msg')
  res.locals.error = req.flash('error')
  next()

})

// 設定 routes
app.use('/auth', authRoutes)
app.use('/profile', profileRoutes)

app.get('/',(req,res)=>{
  return res.render('index', {user: req.user});
})

app.listen(8080, ()=>{
  console.log('server running on port 8080')
})

