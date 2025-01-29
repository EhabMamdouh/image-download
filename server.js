const express = require("express");
const cors = require('cors');
const axios = require("axios");
const sharp = require("sharp");

const app = express();
app.use(cors());

const port = 3000;

// Endpoint to download and compress image
app.get("/download-image", async (req, res) => {
    const imageUrl = req.query.url; // استلام رابط الصورة من الـ query parameter

    if (!imageUrl) {
        return res.status(400).send("يرجى تقديم رابط صورة كـ query parameter (مثل: ?url=https://example.com/image.jpg)");
    }

    try {
        const response = await axios({
            url: imageUrl,
            method: "GET",
            responseType: "arraybuffer", // جلب الصورة كبيانات ثنائية
        });

        let imageBuffer = Buffer.from(response.data); // تحويل البيانات إلى Buffer

        // ضغط الصورة باستخدام sharp
        const compressedImage = await sharp(imageBuffer)
            .jpeg({ quality: 70 }) // جودة 70% لضغط الصورة
            .resize({ width: 1920 }) // تصغير العرض (يحافظ على الأبعاد الأصلية)
            .toBuffer();

        console.log(`Original Size: ${(imageBuffer.length / 1024 / 1024).toFixed(2)} MB`);
        console.log(`Compressed Size: ${(compressedImage.length / 1024 / 1024).toFixed(2)} MB`);

        // التحقق مما إذا كانت الصورة لا تزال أكبر من 2 ميجا، فيتم ضغطها أكثر
        let quality = 70;
        while (compressedImage.length > 2 * 1024 * 1024 && quality > 30) {
            quality -= 10;
            imageBuffer = await sharp(imageBuffer)
                .jpeg({ quality })
                .resize({ width: 1920 })
                .toBuffer();
        }

        res.setHeader("Content-Disposition", `attachment; filename="compressed-image.jpg"`);
        res.setHeader("Content-Type", "image/jpeg");

        res.send(imageBuffer);
    } catch (error) {
        console.error("Error processing the image:", error.message);
        res.status(500).send("فشل تحميل الصورة. يرجى التحقق من الرابط.");
    }
});

app.listen(port, () => {
    console.log(`✅ Server running on http://localhost:${port}`);
});
