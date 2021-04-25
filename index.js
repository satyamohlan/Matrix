var express=require('express');
const socketio = require('socket.io');
const moment=require('moment');
const http= require('http');
const passport = require('passport');
const passportSetup = require('./config/passport-setup');
const user = require('./models/user.js');
const message = require('./models/record.js');

const cookieSession = require('cookie-session');
const mongoose = require('mongoose');
const db = require('./config/keys').MongoUri;

mongoose.connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('mongo db connected'))
  .catch((err) => console.log(err));

const app=express();
const server = http.createServer(app);
const io = socketio(server);

const port=process.env.PORT||3000;
app.use('/css', express.static('views/css'));
app.use('/js', express.static('views/js'));
app.use('/assets', express.static('views/assets'));

app.use(express.static('public'));


app.set('view engine', 'ejs');
app.use(
  cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: ['mrclean'],
  })
);
app.use(
  express.urlencoded({
    extended: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

server.listen(port,()=>console.log(`listen at port ${port}`));
app.get('/',(req,res) => {
  if(req.user){
    if(!req.user.username){
    res.redirect('/setin');  
    }
  else{
    res.redirect('/dashboard');
  }}
  else{
  res.redirect('/login');}
})
app.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile'],
  })
);
app.get('/google/redirect', passport.authenticate('google'), (req, res) => { 

  res.redirect('/dashboard');}
);
app.get('/setin',(req,res) => {
  if(req.user){
  if(!req.user.username){
    if(req.user.photo){
      res.render('setin',{photo:req.user.photo});
    }
  else{
    res.render('setin');
  }
  }
  else{
    res.redirect('/dashboard');
  }}
  else{
    res.redirect('/login');
  }
})
app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  var {
    name,
    email,
    password,
    cpassword
  } = req.body;
  let errors = [];
  if (!name || !email || !password || !cpassword) {
    errors.push('Please fill in all the fields');
  }
  if (password != cpassword) {
    errors.push('Passwords do not match');
  }
  if (password.length < 6) {
    errors.push('Password Too weak');
  }
  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      cpassword,
    });
  } else {
    user
      .findOne({
        email: email,
      })
      .then((User) => {
        if (User) {
          errors.push('Email already exists');
          res.render('register', {
            errors,
            name,
            email,
            password,
            cpassword,
          });
          console.log(errors);
        } else {
          var newUser = new user({
            name: name,
            email: email,
            password: password,
          });
          console.log(newUser);
          newUser.save().then((user) => {
            res.redirect('/login');
          });
        }
      });
  }
});
app.post('/login', (req, res) => {
  passport.authenticate(
    'local', {
      failureRedirect: '/login',
    },
    (err, User, info) => {
      if (err) throw err;
      if (!User) {
        res.render('login', {
          errors: [info.message],
        });
      } else {
        req.logIn(User, (err) => {
          if (err) throw err;
          if(!req.user.username){
            res.redirect('/setin');
           }
          else{
          res.redirect('/');}
        });
      }
    }
  )(req, res);
});
app.get('/login', (req, res) => {
  res.render('login');
});
app.get('/logout', (req, res) => {
  const socketId = req.session.socketId;
  if (socketId && io.of("/").sockets.get(socketId)) {
    console.log(`forcefully closing socket ${socketId}`);
    io.of("/").sockets.get(socketId).disconnect(true);
  }
  req.logOut();
  res.redirect('/');
});
app.get('/checkusername?',(req,res) => {
var {str}=req.query;

user.findOne({username:str}).then((user)=>{
if(user){
res.json({success:false,message:'Account already exists' });}
else{
  res.json({success:true,message:`Username ${str} is available` });}

})
});
app.post('/updateinfo',(req,res) => {
  const {username}=req.body;
  console.log(username);
  if(req.user){
  user.findOneAndUpdate({'_id':req.user.id},{username:username},{useFindAndModify:false},(user)=>{
  console.log('success');
  })
user.findOne({'_id':req.user.id},(user)=>{
res.json({success:true});
})
}});
app.get('/dashboard',(req,res) => {
  if(req.user){
    if(!req.user.username){
      res.redirect('/setin')
  
    }
  else{
    message.find({to:'all'},(err,messages)=>{
      if(err){throw err}
      if(messages){
        console.log(messages);
        res.render('dashboard',{user:req.user,messages:messages});

      }
    })
  }}
  else {
    res.redirect('/login');
  }
})
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);


io.use(wrap(cookieSession({
  maxAge: 24 * 60 * 60 * 1000*14,
  keys: ['mrclean'],
})));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));
io.use((socket, next) => {
  if (socket.request.user) {
    next();
  } else {
    next(new Error('unauthorized'))
  }
});
io.on('connection', socket => {
  console.log('New User',socket.request.user);
  socket.on('chat message', (msg) => {
    console.log('message: ' + msg.message);
    msg.time=moment();
    msg.disptime=moment().format('h:mm a');
    msg.from=socket.request.user.name;console.log(msg);
    let messager=new message(msg);
    messager.save().then((messages)=>{
      socket.broadcast.to('room').emit('chat message', messages);
      msg.self=true;
      socket.emit('chat message',msg); 
    })
    

  });
  socket.on('join room',({room})=>{
    socket.join('room');
    let msg=new message({message:`${socket.request.user.name} has joined the chat`,from:"ChatterBot",time:moment(),disptime:moment().format('h:mm a')});
    msg.save().then(messages=>{
      console.log(messages);

      socket.broadcast.to('room').emit('chat message',messages);
      
    }).catch((err)=>{if(err){throw err}})
    // io.to('room').emit('room users',{user:user.room,users:getRoomUsers(user.room)});
  })
  socket.on('disconnect', () => {
    let msg=new message({message:`${socket.request.user.name} has left the chat`,from:"ChatterBot",time:moment(),disptime:moment().format('h:mm a')});
    msg.save().then(messages=>{
      socket.broadcast.to('room').emit('chat message',messages);

    }).catch((err)=>{if(err){throw err}})
    // io.to('room').emit('room users',{roomer:'room',users:getRoomUsers(user.room)});

  });

})