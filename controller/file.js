const fs = require('fs');
var path = require('path');
var mime = require('mime');
const Model = require('../model/schema')


module.exports.fetch_files = async function(req, resp, next){
    try {
        let files = await Model.file.find({})
        .populate('user', ['lname', 'fname'])
        resp.status(200).json(files)
    } catch (error) {
        next(error)
    }
    
}

module.exports.search_file = async function(req, resp, next){
    try {
        let files = await Model.file.find({search_name: req.params.key}).populate("user", ["fname", "lname"])
        resp.status(200).json(files)
    } catch (error) {
        next(error)
    }
}

module.exports.file_upload = async function(req, resp, next) {
    try {
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
                for (file of files) {
                    let file_name = file.name
                    file_path = './uploads/' + file_name

                    let fileExist = await Model.file.findOne({file_name: file_name})
    
                    if (fileExist) {
                        continue
                    } else {
                        let end = file_name.indexOf(".")
                        let search_name = file.name.slice(0, end)
                        file.mv(file_path, async function(err) {
                            if (err) {
                                throw(err)
                            } else {
            
                                let newFile = new Model.file ({
                                    file_name: file_name,
                                    file_path: file_path,
                                    search_name: search_name,
                                    file_type: file.mimetype,
                                    user: req.body.user,
                                    date_created: date,
                                    time_created: time
                                })
                                await newFile.save((err, data) => {
                                    if(err) throw err
                                })
                            }
                        })
                    }
                }
                resp.status(200).json("Files Uploaded successfully")
            } else {
                let file_name = files.name
                file_path = './uploads/' + file_name

                let fileExist = await Model.file.findOne({file_name: file_name})

                if (fileExist) {
                    resp.status(200).json(`A file with the file name ${file_name} already exist`)
                } else {    
                    files.mv(file_path, async function(err) {
                        if (err) {
                            throw(err)
                        } else {            
                            let newFile = new Model.file ({
                                file_name: file_name,
                                file_path: file_path,
                                file_type: files.mimetype,
                                user: req.body.user,
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
            Model.file.findOneAndDelete({file_name: req.body.file_name}, (err, data) => {
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
        start1_dep =  path1.indexOf("controller")
        start = path1.indexOf("\\controller")

        end = path1.length

        path_dep = path1.slice(0, start1_dep)
        path_dev = path1.slice(0, start)

        let deployment_path = path_dep + `uploads/${req.params.file_name}`
        let fileLocation =  path_dev + `\\uploads\\${req.params.file_name}`;

        let file = req.params.file_name
        resp.download(deployment_path, file);
        
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