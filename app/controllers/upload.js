const del = require('del');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const config = require('nconf');
const sharp = require('sharp');
const Attachment = require('../models/attachment');

const imageFilter = function (req, file, cb) {
    // accept image only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

const cleanFolder = function (folderPath) {
    // delete files inside folder but not the folder itself
    del.sync([`${folderPath}/**`, `!${folderPath}`]);
};


const _upload = (req, res, next) => {
    console.log('uploading---');
    const pathUser = path.join(config.get('PWD') + config.get('uploadPath') + req.user.username);

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, pathUser)
        },
        filename: function (req, file, cb) {
            cb(null, file.fieldname + '-' + Date.now() + '.jpg')
        }
    });

    const upload = multer({
        storage: storage, fileFilter: imageFilter
    }).single('profileImage');

    console.log(upload);

    upload(req, res, function (err) {
        if (err) {
            res.status(401).json({ message: err });
        } else {
            const attachment = new Attachment({
                url: req.file.path,
                type: "Image"
            });
            attachment.save(function (err) {
                if (err) res.status(401).json({ message: err });
                else {
                    sharp.cache(false);
                    sharp(path.join(pathUser, req.file.filename))
                        .resize(200, 300, {
                            kernel: sharp.kernel.lanczos2,
                            interpolator: sharp.interpolator.nohalo
                        })
                        .background('black')
                        .embed()
                        // .toFile(path.join(pathUser, "avatar-" + req.file.filename))
                        .toBuffer()
                        .then(function (buffer) {
                            fs.writeFile(path.join(pathUser, req.file.filename), buffer, function (e) {
                                if (e) res.status(401).json({ message: e });
                                else {
                                    res.status(200).json({ message: "done" });
                                }
                            });
                        })
                        .catch(function (err) {
                            res.status(401).json({ message: err });
                        });
                }
            });
        }
    });


};




module.exports = _upload;

