import fs from "fs";
import path from "path";
import multer from "multer";
import { v4 } from "uuid";


/** MULTER IMAGE UPLOADER */
function getTargetImageStorage(address: string) {
    return multer.diskStorage({
        destination: function (req, file, cb) {
            const dir = `./uploads/${address}`;
            fs.mkdirSync(dir, { recursive: true }); // papka bolmasa, avtomatik yaratadi
            cb(null, dir);
        },
        filename: function (req, file, cb) {
            const extension = path.parse(file.originalname).ext;
            const random_name = v4() + extension;
            cb(null, random_name);
        },
    });

}

const ALLOWED_MIME = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const makeUploader = (address: string) => {
    const storage = getTargetImageStorage(address);
    return multer({
        storage: storage,
        limits: { fileSize: MAX_FILE_SIZE },
        fileFilter: (req, file, cb) => {
            // faqat rasm fayllarini qabul qilamiz
            cb(null, ALLOWED_MIME.includes(file.mimetype));
        },
    });
};

export default makeUploader;
