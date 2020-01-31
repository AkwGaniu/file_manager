const routes = require('express').Router()
// const express = require('express')
// app = express()
const file_controler = require('../controller/file')


routes.post('/file_upload', file_controler.file_upload)
routes.get('/fetch_files/:userId', file_controler.fetch_files)
routes.get('/search_files/:key/:userId', file_controler.search_file)
routes.delete('/delete_file', file_controler.delete_file)
routes.get('/download/:file_name', file_controler.download)
routes.get('/preview_file/:file_name', file_controler.preview_file)


module.exports = routes