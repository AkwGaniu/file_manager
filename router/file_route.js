const routes = require('express').Router()
// const express = require('express')
// app = express()
const file_controler = require('../controller/file')


routes.post('/file_upload', file_controler.file_upload)
routes.get('/fetch_files', file_controler.fetch_files)
routes.get('/search_files/:key', file_controler.search_file)
routes.delete('/delete_file', file_controler.delete_file)


module.exports = routes