const mongoose = require('mongoose')

const { MONGO_URL } = process.env

exports.connect = () => { // connect is the name of method which is being exported
    mongoose.connect(MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(console.log('Connection with database successfull ....'))
    .catch(error => {
        console.log('Connection with database failed!')
        console.log(error)
        process.exit(1)
    })
}