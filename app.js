require("dotenv").config() // inside config path of dotenv can be passed if not in root directory
require('./config/database').connect()
const express = require('express')
const bodyParser = require('body-parser')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')

const User = require('./model/user')
const auth = require('./middleware/auth')


const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cookieParser())

app.get('/', (req, res) => {
    res.send("Hello")
})

app.post("/register", async (req, res) => {
    // const firstname = req.body.firstname firstname coming from body of request
    try {
        // console.log(req.body)
        const {
            firstname,
            lastname,
            email,
            password
        } = req.body
    
        if (!(email && password && firstname && lastname)) {
            return res.status(400).send('All fields are required.')
        }
    
        const existingUser = await User.findOne({ email }) // finding the user based on email
    
        if (existingUser) {
            res.status(401).send('User already exists')
        }
    
        const myEncPassWord = await bcrypt.hash(password, 10)
        
        const user = await User.create({ // to create user in the database
            firstname,
            lastname,
            email: email.toLowerCase(),
            password: myEncPassWord
        })
    
        // creating token
        const token = jwt.sign(
            {user_id: user._id, email}, // user._id coming from database
            process.env.SECRET_KEY,
            {
                // if hashing algorithm has to be changed then it can be done here
                expiresIn: "2h"
            }
        )
    
        user.token = token
        user.password = undefined // in order to not return the passsword

        // send token or send success user and the frontend will redirect user

        res.status(201).json(user)
    } catch (error) {
        console.log(error)
    }

})

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body

        if (!(email && password)) {
            res.status(400).send("All fields are required")
        }

        const user = await User.findOne({ email })
        // if (!user) {
        //     res.status(400).send("You are not registered.")
        // }

        // bcrypt.compare(password, user.password) // comparing password coming from body with password in database
        
        if (user && (await bcrypt.compare(password, user.password))) {
            // generate a token and send it back
            const token = jwt.sign(
                {user_id: user._id, email},
                process.env.SECRET_KEY,
                {
                    expiresIn: "2h"
                }
            )
            user.token = token // attaching the token to user object
            user.password = undefined

            // res.status(200).json(user)

            // if cookies has to be used
            const options = {
                expires: new Date(
                    Date.now() + 3 * 24 * 60 * 60 * 1000
                ), // date when will the cookie will be expired
                httpOnly: true // only readable in the backend
            }
            // sending cookie
            res.status(200).cookie('token', token, options).json({ // if any application cannot handle cookie then json
                success: true,
                token,
                user
            }) // has to be same name as req.cookie.<name>

        }

        res.send(400).send("Email or Password is incorrect.")

    } catch (error) {
        console.log(error)
    }
})

app.get("/dashboard", auth, async (req, res) => {
    const { email } = req.body
    const user = await User.findOne({ email })

    // res.clearCookie('token') // in order to remove the key if needed

    res.status(200).send(`${user.firstname} ${user.lastname} Welcome to the dashboard.`)
})

module.exports = app