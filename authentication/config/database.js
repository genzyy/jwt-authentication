var mongoose = require('mongoose')

var mongourl = 'mongodb://localhost/authentication'

//initiatialzing mongo server
var InitiateMongoServer = async function() {
    try {
        await mongoose.connect(mongourl, {
            useNewUrlParser: true
        })
        console.log('Connected to DB...')
    } catch(error) {
        console.log(error)
        throw error
    }
}

//exporting the function for app.js
module.exports = InitiateMongoServer