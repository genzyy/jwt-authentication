var express = require('express')        //express routing
var bodyParser = require('body-parser')     //getting information from the body
var user = require('./routes/user')     //user routes for login and signup
var mongoose = require('mongoose')      //database connection
var InitiateMongoServer = require('./config/database')      //function for initializing database connection

InitiateMongoServer()       //connection with the database server
var app = express()
app.use(bodyParser.json())      //to use data format as json
mongoose.connect('mongodb://localhost/authentication')

//home route
app.get('/',function(req,res) {
    res.json({ message: 'API working here' })
})

//to use /user as a prefix to all routes
app.use('/user', user)

//started server function
app.listen(5000,function() {
    console.log('SERVER STARTED RUNNING...')
})