const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20')
const User = require('../models/user-model')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcrypt')

// 第一個參數user會自動帶入google strategy的done()中的第二個參數
passport.serializeUser((user, done)=>{
  console.log('序列化使用者...')
  // console.log(user)
  // 將mongoDB的id存在session
  // 並且將id簽名後已cookie的形式給使用者
  // 並會將req.isAuthenticated() 設為 true, 可以用來判斷使用者是否登入
  // 將user._id簽名後存入cookie
  done(null, user._id) 
})


passport.deserializeUser(async (_id, done)=>{
  console.log('Deserialize使用者,使用serializeUser儲存的id去找到資料庫內的資料');
  let foundUser = await User.findOne({ _id });
  console.log(foundUser)
  // 將req.user這個屬性設定為foundUser
  done(null, foundUser)
})

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECTET,
      callbackURL: "http://localhost:8080/auth/google/redirect"
    },
    async function(accessToken, refreshToken, profile, done) {
      console.log('進入Google strategy的區域')
      // console.log(profile)
      // console.log('=====================================')

      let foundUser = await User.findOne({googleID: profile.id}).exec()
      if(foundUser){
        console.log(foundUser)
        console.log('使用者已經註冊過了')
        // 執行done會將參數傳到上面的passport.serializeUser並執行
        done(null, foundUser)
      }else{
        console.log('偵測到新用戶');
        let newUser = new User({
          name: profile.displayName,
          googleID: profile.id,
          thumbnail: profile.photos[0].value,
          email:profile.emails[0].value,
        })
        let saveUser = await newUser.save();
        console.log('成功創建新用戶');
        // 執行done會將參數傳到上面的passport.serializeUser並執行
        done(null, saveUser)
      }

    }
));

passport.use(new LocalStrategy(
  async (username, password, done)=>{
    let foundUser = await User.findOne({ email: username })
    if(foundUser) {
      let result = await bcrypt.compare(password, foundUser.password);
      if(result){
        console.log('登入成功')
        done(null, foundUser)
      }else{
        done(null,false)
      }
    }else{
      done(null,false)
    }


  }
))