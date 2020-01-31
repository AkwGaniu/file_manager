const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const upload_file= require('express-fileupload')

//IMPORT ROUTES
const file_routes  = require('./router/file_route')
const userRouter = require('./router/user_route')

const app = express()

//CONFIGURE ENVIRONMENT VARIABLE HOLDER
dotenv.config()

//DATABASE CONNECTION
mongoose.connect(process.env.DB_CONNECT, {useNewUrlParser: true}, (err) => {
    if(err) return console.log(`Error: ${err}`)
    console.log("We are connected")
})


//CREATE BODY PARSER MIDDLE WARE
app.use(express.json())

app.use(upload_file())

app.use((req, resp, next) => {
    resp.header('Access-Control-Allow-Origin', '*')
    resp.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE')
    resp.header('Access-Control-Allow-headers', 'Content-type, Accept, x-access-token, x-key')

    if(req.method === 'OPTIONS') {
        resp.status(200).end()
    } else {
        next()
    }
})

//CREATE ROUTE MIDDLE WARE
app.use('/file', file_routes)
app.use('/user', userRouter)

app.use((req, resp, next) => {
    const err = new Error("Page not found")
    err.status = 404
    next(err)
})

//Custom Error Handler middleware
app.use((error, req, resp, next) => {
    resp.status(error.status || 500)

    resp.json({
        status: error.status,
        message: error.message,
        // stack: error.stack
    })
})


//LISTEN TO PORT
const PORT = process.env.PORT || 3000

app.listen(PORT, (err) => {
    if(err) throw err
    console.log(`Wa are listening to port ${PORT}`)
})