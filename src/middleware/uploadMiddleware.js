//installed multer- Multer is middleware that reads files from incoming HTTP requests and makes them available to us in req.file.
//express.json() reads JSON → req.body, multer reads files → req.file

import multer from "multer";
const storage = multer.memoryStorage();   //used in-memory storage since the file is processed immediately

const upload = multer({
    storage, 
    limits: {
        fileSize: 5 * 1024 * 1024   // 5 mb limit
    },
    fileFilter : (req, file, cb) => {
        if(file.mimetype === 'application/pdf'){
            cb(null, true);
        } else {
            cb(new Error("only pdf files are allowed"), false);
        }
    }
});

export default upload;