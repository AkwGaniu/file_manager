const fs = require('fs');
const cloudinary = require('cloudinary')

const Model = require('../model/schema')

// MULTER
const multer = require('multer')
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname)
  }
})

cloudinary.config({ 
    cloud_name: 'djxyqrkmi', 
    api_key: '936229992257755', 
    api_secret: 'f2EmndyU3QzODgVQ6_VP8LnFF3A' 
});

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
        let files = await Model.file.find({file_name: req.params.key}).populate("user", ["fname", "lname"])
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

        let date = `${day}/${month}/${year}`
        let time = `${hour}:${min}`

        if (req.files) {
            let files = req.files.file
            const allowed_files = [ ".jpeg", ".JPEG", ".jpg", ".JPG", ".PNG", ".png", ".ppm", ".pgm", ".webp", ".pbm", ".tiff", ".pdf", ".PDF", ".svg"]
            let existing_files = []
            let all_files = []

            if (files.length >= 2) {
                // for (file of files) 
                
                for(let i = 0; i<= files.length; i++){
                    let file_name = files[i].name
                    file_path = './uploads/' + file_name
                    let start = file_name.indexOf(".")
                    let file_type = files[i].name.slice(start, files[i].name.length)

                    all_files.push(file_path)

                    if (allowed_files.includes(file_type)) {

                        let fileExist = await Model.file.findOne({file_real_name: file_name})

                        if (fileExist) {
                            existing_files.push(file_name)
                            continue
                        } else {
                            files[i].mv(file_path, async function(err) {
                                if (err) throw(err)
                                cloudinary.v2.uploader.upload(file_path, async function(error, result) {
                                    if (error) return next(error)
                                    let newFile = new Model.file ({
                                        file_real_name: file_name,
                                        file_name: result.original_filename,
                                        file_path: result.secure_url,
                                        file_type: result.format,
                                        user: req.body.user,
                                        date_created: date,
                                        time_created: time
                                    })


                                    await newFile.save((err, data) => {
                                        if(err) throw err
                                        console.log(file_path)                                            
                                    })
                                })
                                
                            })
                        }
                    } else {
                        return resp.status(401).json("The selected files contain unsupported file format")
                        break
                    }
                }
                if (existing_files.length > 0) {
                    let reply = {"Existing_files": existing_files}
                    return resp.status(200).json(reply)
                } else {
                    return resp.status(200).json("Files Uploaded successfully")
                }
            } else {
                let file_name = files.name
                file_path = './uploads/' + file_name

                let start = file_name.indexOf(".")
                let file_type = file_name.slice(start, file_name.length)

                if (allowed_files.includes(file_type)) {

                    let fileExist = await Model.file.findOne({file_real_name: file_name})

                    if (fileExist) {
                        return resp.status(200).json(`A file with the file name ${file_name} already exist`)
                    } else {
                        files.mv(file_path, async function(err) {
                            if (err) throw(err)
                            
                            cloudinary.v2.uploader.upload(file_path, function(error, result) {
                                if (error) return next(error)
                                let newFile = new Model.file ({
                                    file_real_name: file_name,
                                    file_name: result.original_filename,
                                    file_path: result.url,
                                    file_type: result.format,
                                    user: req.body.user,
                                    date_created: date,
                                    time_created: time
                                })

                                newFile.save((err, data) => {
                                    if(err) throw err
                                    resp.status(200).json("Upload successful")
                                })
                            })
                        })
                    } 
                } else {
                    return resp.status(200).json("The selected file format is not allowed")
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
        Model.file.findOneAndDelete({file_real_name: req.body.file_name}, (err, data) => {
            if (err) throw err
            resp.status(200).json('File deleted successfully') 
        })
    } catch (error) {
        next(error)
    }
}
