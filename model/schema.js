const mongoose = require('mongoose')

const fileSchema = new mongoose.Schema({
    file_name: String,
    file_type: String,
    date_created: String,
    time_created: String,
    userId: String,
    file_path: String
})


//CREATE USER SCHEMA
let userSchema = new mongoose.Schema({
    name: String,
    email: String,
    userId: String,
    password: {
        type: String,
        max: 225,
        min: 8
    }
})


//CREATE USER MODEL
module.exports.user = mongoose.model("Users", userSchema)
//URL MODEL
module.exports.file = mongoose.model('file', fileSchema)