const router = require('express').Router();
const passport = require('passport')
const User = require('../models/user-model')
const bcrypt = require('bcrypt')

router.get('/login',(req,res)=>{
  return res.render('login',{user: req.user})
  
})

router.get('/logout',(req,res)=>{
  req.logOut((err)=>{
    if(err) return res.send(err);
    return res.redirect('/')

  })
})

router.get('/signup',(req,res)=>{
  return res.render('signup',{ user: req.user})
})

router.post('/login',passport.authenticate('local',{
    failureRedirect: '/auth/login',
    failureFlash: '登入失敗,帳號或密碼不正確',
  }),
  (req,res)=>{
    return res.redirect('/profile')
  }
)

router.get('/google',
  passport.authenticate('google',{
    // 要拿到全部資料 'profile'
    // 可以選擇登入帳戶 'email'
    // 如果有設定email就要加 prompt: 'select_account'
    scope: ['profile','email'],
    prompt: 'select_account',
  })
)

router.post('/signup', async(req,res)=>{
  let  {name, email, password } = req.body;
  if(password.length < 8){
    req.flash('error_msg',"密碼長度過短,至少8碼");
    return res.redirect('/auth/signup')
  }

  // 確認信箱是否註冊過
  const foundEmail = await User.findOne({ email }).exec();
  if(foundEmail){
    req.flash('error_msg','此信箱已註冊過')
    return res.redirect('/auth/signup')
  }

  let hasHedPassWord = await bcrypt.hash(password, 12);
  let newUser = new User({name, email, password: hasHedPassWord });
  await newUser.save()
  req.flash('success_msg',"恭喜!註冊成功,現在可以登入系統")
  return res.redirect('/auth/login')
})

router.get('/google/redirect',passport.authenticate('google'), (req,res)=>{
  console.log('進入redirect區域')
  return res.redirect('/profile')
})

module.exports = router;