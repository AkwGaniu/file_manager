const mongoose = require('mongoose')

const fileSchema = new mongoose.Schema({
    file_name: String,
    file_type: String,
    search_name: String,
    date_created: String,
    time_created: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    file_path: String
})


//CREATE USER SCHEMA
let userSchema = new mongoose.Schema({
    fname: String,
    lname: String,
    email: {
        type:String,
        required: true
    },
    userId: String,
    password: {
        type: String,
        required: true,
        max: 225,
        min: 8
    }
})


//CREATE USER MODEL
module.exports.user = mongoose.model("users", userSchema)
//URL MODEL
module.exports.file = mongoose.model('files', fileSchema)