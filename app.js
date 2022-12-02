const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");
const ejs = require("ejs");
require('dotenv').config()
console.log(process.env.DATABASE)

const app = express();
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(
  session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://mongodb:27017/laxman')
  .then(() => {
    console.log("Connection successfull....");
  })
  .catch((err) => {
    console.log(err);
});

app.get("/", (req, res)=>{
    res.sendFile("index.html");
});

app.get("/profile", (req, res)=>{
  if(req.isAuthenticated()){
    let user = req.user;
    res.render("profile", {user});
  }else{
    res.render("notLoggedIn")
  }
});

app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

//login user
app.post("/login", function (req, res) {

  let mail = req.body.username;

  let present = User.findOne({username: mail});
  console.log(present)

  if(!present){
    //not able to handle :-(
  }else{
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function(err){
        if(err){
            console.log("Login Failed....");
            console.log(err);
            return res.redirect("/");
        }else{
            passport.authenticate("local")(req, res, function(){
                if(!req.user){
                  res.send("Lollllllll")
                }
                console.log("Login Success...");
                res.redirect("/profile");
            });
        }
    })

  }


});

const userSchema = new mongoose.Schema({
  username: String,
  fullName: String,
  // password: String
});
// userSchema.plugin(passportLocalMongoose);
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);
passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
  done(null, user.id);
});
passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

app.post("/register", function(req, res) {
    console.log(req.body);
    const user = new User({
      username: req.body.username,
      fullName: req.body.fullName,
      // password: req.body.password
    });

    User.register(user, req.body.password, function(err, user){
      if(err){
          console.log(err);
          res.redirect("/errorWhileRegistering");
      }else{
          passport.authenticate("local")(req, res, function(){
              res.redirect("/profile");
          });
      }
  })
}
);

app.listen(process.env.PORT || 3000, ()=>{
    console.log("Server started at http://localhost:3000");
});
