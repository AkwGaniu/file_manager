const fs = require('fs');
var path = require('path');
var mime = require('mime');
const fileModel = require('../model/schema')


module.exports.fetch_files = async function(req, resp, next){
    try {
        // console.log(req.params)
        let files = await fileModel.file.find({}, async (err, data) => {
            if (err) throw err
            resp.status(200).json(data)
        })
    } catch (error) {
        next(error)
    }
    
}

module.exports.file_upload = async function(req, resp, next) {
    try {
        console.log(req.body)
        let ts = Date.now();

        let date_ob = new Date(ts);
        let day = date_ob.getDate();
        let month = date_ob.getMonth() + 1;
        let year = date_ob.getFullYear();
        let hour = date_ob.getHours()
        let min = date_ob.getMinutes()
        let seconds = date_ob.getSeconds()

        let date = `${day}-${month}-${year}`
        let time = `${hour}:${min}:${seconds}`

        if (req.files) {
            let files = req.files.files
            if (files.length >= 2) {
                console.log("more than one")
                for (file of files) {
                    let file_name = file.name
                    file_path = './uploads/' + file_name
    
                    let fileExist = await fileModel.file.findOne({file_name: file_name})
    
                    if (fileExist) {
                        // resp.status(200).json(`A file with the file name ${file_name} already exist`)
                        continue
                    } else {
    
                        file.mv(file_path, async function(err) {
                            if (err) {
                                throw(err)
                            } else {
            
                                let newFile = new fileModel.file ({
                                    file_name: file_name,
                                    file_path: file_path,
                                    file_type: file.mimetype,
                                    userId: req.body.userId,
                                    date_created: date,
                                    time_created: time
                                })
    
                                await newFile.save((err, data) => {
                                    if(err) throw err
                                    // resp.status(200).json("Upload successful")
                                })
                            }
                        })
                    }
                }
                resp.status(200).json("Files Uploaded successfully")
            } else {
                console.log("just one")
                let file_name = files.name
                file_path = './uploads/' + file_name

                let fileExist = await fileModel.file.findOne({file_name: file_name})

                if (fileExist) {
                    resp.status(200).json(`A file with the file name ${file_name} already exist`)
                } else {    
                    files.mv(file_path, async function(err) {
                        if (err) {
                            throw(err)
                        } else {            
                            let newFile = new fileModel.file ({
                                file_name: file_name,
                                file_path: file_path,
                                file_type: files.mimetype,
                                userId: req.body.userId,
                                date_created: date,
                                time_created: time
                            })

                            await newFile.save((err, data) => {
                                if(err) throw err
                                resp.status(200).json("Upload successful")
                            })
                        }
                    })
                }
            }
            
        } else {
            resp.status(200).json("I can't find any file here. Please choose a file and try again")
        }
    } catch (error) {
        next(error)
    }
}

module.exports.delete_file = function(req, resp, next) {
    try {
        // fs.stat('./uploads/amdalat.jeg', function (err, stats) {
        //     if (err) throw err
        //     console.log(stats);//here we got all information of file in stats variable
    // });

         
        fs.unlink(`./uploads/${req.body.file_name}`, function(err){
            if(err) throw err
            fileModel.file.findOneAndDelete({file_name: req.body.file_name}, (err, data) => {
                if (err) throw err
                resp.status(200).json('File deleted successfully') 
            })
        }) 
    } catch (error) {
        next(error)
    }
}

module.exports.download = function(req, resp, next){
    try {
        let path1 = __dirname
        start = path1.indexOf("\\controller")
        end = path1.length
        path11 = path1.slice(0, start)
        let fileLocation =  path11+`\\uploads\\${req.params.file_name}`;
        let file = req.params.file_name
        resp.download(fileLocation, file);
        
    } catch (error) {
        next(error)
    }  
}

module.exports.preview_file = function(req, resp, next){
    try {
        let path1 = __dirname
        start = path1.indexOf("\\controller")
        end = path1.length
        path11 = path1.slice(0, start)
        let fileLocation =  path11+`\\uploads\\${req.params.file_name}`
        resp.status(200).json({"path":fileLocation})
    } catch (error) {
        next(error)
    }  
}