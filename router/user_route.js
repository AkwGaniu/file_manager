const route = require('express').Router()

const userRegController = require('../controller/user')




route.post("/register", userRegController.register)
route.post("/login", userRegController.login)

module.exports = route