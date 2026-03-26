var express = require("express");
var router = express.Router();
const multer = require("multer");
const { writeFile, mkdir } = require("fs/promises");
const path = require("path");

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

// console.log(upload);


router.post("/", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false });
        }

        console.log("file:", req.file);
        console.log("headers:", req.headers["content-type"]);


        if (!req.file.mimetype.startsWith("image/")) {
            return res.status(400).json({ success: false });
        }

        const folder = req.query.folder || "User";
        const prefix = req.query.prefix || "file";

        const uniqueSuffix =
            new Date().toISOString().slice(2, 10).replace(/-/g, "") +
            "-" +
            Math.random().toString(36).substring(2, 8);

        const extension = path.extname(req.file.originalname);
        const filename = `${prefix}-${uniqueSuffix}${extension}`;

        const uploadPath = path.join(
            process.cwd(),
            process.env.SOURCE_DIR,
            folder
        );

        await mkdir(uploadPath, { recursive: true });

        const filePath = path.join(uploadPath, filename);
        await writeFile(filePath, req.file.buffer);

        res.json({
            success: true,
            fileName: `${folder}/${filename}`
        });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

module.exports = router;
