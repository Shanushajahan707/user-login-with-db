const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser')
const morgan = require('morgan')
const nocache = require('nocache')
const session = require('express-session');
const collection = require('../server')
const app = express()
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }))
router.use(morgan('tiny'))
app.use(express.urlencoded({ extended: false }))

app.use(nocache())
/* GET home page. */

router.use(session({
  secret: 'secret key',
  resave: false,
  saveUninitialized: true,
  // cookie: { secure: false, maxAge: 600000000 }
}))

router.get('/', function (req, res) {
  let user = req.session.user;
  console.log(user);
  if (user) { // Check if email is stored in the session
    res.render('user-home', { content: user.email })
  } else {
    res.redirect('/user-login');
  }
});

router.get('/user-login', function (req, res) {
  if (req.session.user) {
    res.redirect('/')
  }
  else {
    res.render('user-login')
  }
});

router.get('/home', function (req, res) {
  res.render('user-home');
});

router.post('/user-login', async (req, res) => {
  try {
    const data = await collection.findOne({ email: req.body.email })
    if (req.body.email === data.email && req.body.password === data.password) {
      req.session.user = data
      res.redirect('/')
    } else {
      res.send('invalid user')
    }
  }
  catch {
    res.send('something wrong in users db')
  }
});


router.get('/signup', (req, res) => {
  res.render('user-signup')
})
router.post('/signup', async (req, res) => {
  if (!isEmailValid(req.body.email)) {
    res.render('user-signup', { message: 'Email not valid' })

  }

  else {
    if (req.body.uname === null || req.body.uname.trim() === "") {
      console.log("enter the req");
      res.render('user-signup', { message: 'the username must be filled' })
    }
    else {
      const data = {
        username: req.body.uname,
        email: req.body.email,
        password: req.body.pswd
      }
      const find = await collection.findOne({ email: req.body.email }) //check the existing email
      if (find == null) {
        await collection.insertMany([data])
        res.redirect('/user-login')
      } else {
        res.render('user-signup', { message: 'Email already exist' })
      }
    }


  }
})

function isEmailValid(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}


router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/user-login')
})


module.exports = router;
