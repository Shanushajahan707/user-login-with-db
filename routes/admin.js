const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser')
const morgan = require('morgan')
const nocache = require('nocache')
const session = require('express-session');
const collection = require('../server');
const app = express()
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }))
router.use(morgan('tiny'))
app.use(express.urlencoded({ extended: false }))

app.use(nocache())
/* GET home page. */
//session middileware
router.use(session({
    secret: 'secret key',
    resave: false,
    saveUninitialized: true
}))


//login route

router.get('/admin-login', async (req, res) => {
    console.log(req.session.data);
    let adminpresent = req.session.data
    if (adminpresent) {
        res.redirect('/admin/admin')
    } else {
        res.render('admin-login')
    }
})

//admin -home route
// router.get('/dashboard', (req, res) => {
//     console.log("enter the home");
//     res.render('home')
// })

router.get('/admin', async (req, res) => {
    try {
        if (req.session.data) {
            console.log('enter the home');
            const datas = await collection.find();
            res.render('home', { datas, msg: "enter the home" });
        }
        else {
            res.redirect('admin-login')
        }

    }
    catch {
        console.log(error);
    }

});

// function checking(req, res, next) {
//     if (req.body.email === "admin@gmail.com") {
//         res.render('/admin/admin')
//         next()
//     }
// }


//admin login post request 
router.post('/admin-dashboard', async (req, res) => {
    try {
        const admin = {
            username: "admin",
            password: "admin123"
        }
        if (req.body.username === admin.username && req.body.password === admin.password) {
            req.session.data = admin
            res.redirect('/admin/admin')
        }
        else {
            console.log("enter the login else");
            res.render('admin-login', { message: "Invalid Entry " })
        }
    }
    catch {
        console.log("error");
    }
})

//add new user admin side
router.get('/add-user', (req, res) => {
    res.render('admin-adduser')
})
//add user post request 
router.post('/admin-adduser', async (req, res) => {
    try {
        console.log("");
        if (!isEmailValid(req.body.email)) {
            res.render('admin-adduser', { message: 'Email not valid' })
        } else {
            const data = {
                username: req.body.uname,
                email: req.body.email,
                password: req.body.pswd
            }
            const find = await collection.findOne({ email: req.body.email }) //check the existing email
            if (find == null) {
                await collection.insertMany([data])
                res.render('admin-adduser', { message: 'Successfully added new user' })
            } else {
                res.render('admin-adduser', { message: 'Email already exist' })
            }
        }
    }
    catch {
        console.log(error.log)
    }
})
//checking email regex
function isEmailValid(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}
//update route with param id
router.get('/update/:id', (req, res) => {
    const id = req.params.id
    console.log(id);
    collection.findById(id)
        .then(user => {
            if (!user) {
                res.redirect('/admin-login')
            } else {
                res.render('update-user', { user: user })
            }
        })
        .catch(err => {
            console.log("Error in finding the user : ", err);
            res.redirect('/admin-login')
        })
})
//update param post request 
router.post('/update-user/:id', async (req, res) => {
    try {
        let id = req.params.id
        const result = await collection.findByIdAndUpdate(id, {
            username: req.body.uname,
            email: req.body.email
        })
        if (!result) {
            console.log("enter not found");
            res.json({ message: 'User not found', type: 'danger' })
            res.render('update-user')

        } else {
            console.log("enter updated");
            collection.findById(id)
                .then(user => {
                    if (user) {
                        res.render('update-user', { user, message: 'updated' })

                    }
                })
        }
    } catch (err) {
        console.log('Error updating the user : ', err);
    }
})

//delete route
router.get('/delete/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const result = await collection.findByIdAndRemove({ _id: id });

        if (result) {
            console.log("enter the delete if");
            const datas = await collection.find()
            res.render('home', { datas, msg: "deleted" })

        }
        else {
            res.json({ msg: 'User not found' });
        }

    } catch (err) {
        console.error('Error deleting user: ', err);
        res.json({ msg: err.message });
    }
});

router.get('/search', async (req, res) => {
    const searchQuery = req.query.search
    const regexPattern = new RegExp(`^${searchQuery}`, 'i')
    console.log('ebtered');

    const filteredUser = await collection.find({ username: { $regex: regexPattern } })
    res.json(filteredUser)

})

router.get('/logout', (req, res) => {
    req.session.destroy()
    // res.render('admin-login')
    res.redirect('/admin/admin-login')
})
module.exports = router;