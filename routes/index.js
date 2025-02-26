var express = require('express');
var router = express.Router();
var passport = require("passport");
var userModel = require("./users");
var postModel = require("./posts");

const localStrategy = require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));

router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/login', function(req, res, next) {
  res.render('login');
});


router.get('/profile', isLoggedIn ,function(req, res, next) {
  userModel.findOne({username : req.session.passport.user})
  .populate("posts")
  .then(function(foundUser){
    res.render('profile' , {foundUser});
  })
});


router.get('/feed', isLoggedIn, function (req, res, next) {
  userModel
  .findOne({username : req.session.passport.user})
  .then(function(user){
    postModel
    .find()
    .populate("userid")
    .then(function (allposts){
    res.render("feed", {allposts ,user});
    });
  })
  }); 

 router.get('/like/:postid',(req,res)=>{
  userModel.findOne({username : req.session.passport.user})
  .then(function(user){
    postModel.findOne({_id : req.params.postid})
    .then(function(post){
      if(post.likes.indexOf(user._id)===-1){
        post.likes.push(user._id);
      }
      else{
        post.likes.splice(post.likes.indexOf(user._id), 1);
      }
      post.save()
      .then(function(){
        res.redirect("back");
      })
    })
  })
 }) 


router.get('/read', function(req, res, next) {
userModel.find().then(function(u){
  res.send(u)
})
});

router.post('/post', isLoggedIn ,function (req, res, next) {
  userModel.findOne({username : req.session.passport.user})
  .then(function(user){
    postModel.create({
      userid : user._id,
      data : req.body.post
    })
    .then(function(post){
      user.posts.push(user._id);
      user.save()
    .then(function(u){
      res.redirect("back");
    })
    })
  })
});


router.post('/register', function (req, res, next) {
  userModel.findOne({username : req.body.username})
  .then(function(foundUsername){
    if(foundUsername){
      res.send("Username all-ready exist.");
    }
    else{
      var newUser = new userModel({
        username : req.body.username,
        age : req.body.age,
        image : req.body.image
      })
      userModel.register(newUser,req.body.password)
      .then(function(u){
        passport.authenticate('local')(req,res,function(){
          res.redirect('/profile');
        })
      })
    }
  })
});

router.post('/login', passport.authenticate('local',{
  successRedirect: '/profile',
  failureRedirect : '/login'
}),function(req,res,next){});


router.get('/logout' , function(req,res,next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/login');
  });
});


function isLoggedIn(req,res,next){
if(req.isAuthenticated()){
  return next();}
  else{
    res.redirect('/login');
  }
}

module.exports = router;
