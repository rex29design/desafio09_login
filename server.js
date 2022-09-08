const express = require("express")
const cookieParser = require("cookie-parser")
const session = require("express-session")
const MongoStore = require("connect-mongo")
const path = require("path")
const bodyParser = require("body-parser")
const app = express()

const mongoose = require("mongoose")
const User = require("./model/user")

app.use(cookieParser())
app.use(session ({
    store: new MongoStore ({mongoUrl: "mongodb://127.0.0.1/sessions"}), 
    secret: "voldemort",
    resave: false,
    saveUninitialized: true
}))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))

app.use(express.static(path.join(__dirname, "public")))

const mongo_uri = "mongodb://127.0.0.1/users"

mongoose.connect(mongo_uri, function(err){
    if (err) {
        throw err
    } else {
        console.log("Successfully connected to DB");
    }
})

//Middleware de autenticación//
function auth(req, res, next) {
    if(req.session.admin) {
        return next()
    }
    return res.status(401).send("No autorizado") 
}

app.post("/register", (req, res) => {
    const {username, password} = req.body
    const user = new User({username, password})
    user.save(err => {
        if(err){
            res.status(500).send("Error to register")
        } else {
            res.status(200).send("User registered")
        }
    })
})

app.post("/login", (req, res) => {
   try {
    const {username, password} = req.body
    req.session.username = username
    req.session.admin = true
    res.send("<h2>Login success</h2>")

   } catch (err) {
    console.log(err);
   }

})

app.get("/logout", (req, res) => {
    req.session.destroy(err => {
        if(!err) res.send("<h2>Logout ok</h2>")
        else res.send({status: "Logout error", body: err})
    })
})

app.get("/private", auth, (req, res) => {
    res.send(`<h2>Welcome <i>${req.session.username}</i></h2>`)
})


app.listen(8080, () => {
    console.log("Server listening...");
})