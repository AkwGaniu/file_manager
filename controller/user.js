const bcrypt = require('bcryptjs')
const shortId = require('shortid')


const Model = require('../model/schema')


module.exports.register = async (req, res) => {
    
    //HASH USER PASSWORD
    const salt = await bcrypt.genSalt(10)
    const hashedPass = await bcrypt.hash(req.body.password, salt)

    //USER IDENTITY
    let userIdGen = shortId.generate();


    //Get user details from the form and update the database
    Model.User.find({email: req.body.email}, {name: false, password: false}, (err, data)  => {
        if(err) throw err
        if(data.length === 0) {
            const record = {
                name: req.body.name,
                email: req.body.email,
                userId: userIdGen,
                password: hashedPass
            }

            Model.User(record).save((err, data) => {
            if(err) throw err
                res.status(200).json("Success")
            })
        } else {
            res.status(200).json("Email already exist, Please proceed to login")
        }
    })
    
}


module.exports.login = async (req, res) => {
    //Get user details from the login page and validate the login
    const user = await Model.user.findOne({email: req.body.email})
    if (!user) return res.status(401).json("Invalid email")

    // CONFIRM USER PASSWORD
    const validPassword = await bcrypt.compare(req.body.password, user.password)
    if (!validPassword) return res.status(401).json("Invalid passsword")
    res.status(200).json({
        name: user.name,
        email: user.email,
        userId: user.userId
    })
}





