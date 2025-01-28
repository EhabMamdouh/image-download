const express = require("express");
const axios = require("axios");
const cors = require('cors');

const app = express();
app.use(cors());

const port = 3000;

// Endpoint to fetch image and stream it to the client
app.get("/download-image", async (req, res) => {
    const imageUrl = req.query.url; // Get image URL from query parameter

    if (!imageUrl) {
        return res.status(400).send("Please provide an image URL as a query parameter (e.g., ?url=https://example.com/image.jpg)");
    }

    try {
        const response = await axios({
            url: imageUrl,
            method: "GET",
            responseType: "stream", // Fetch image as stream
        });

        const fileName = `image-${Date.now()}.jpg`; // Dynamic file name
        res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
        res.setHeader("Content-Type", response.headers["content-type"]);

        response.data.pipe(res); // Stream image data to the client
    } catch (error) {
        console.error("Error fetching the image:", error.message);
        res.status(500).send("Failed to download the image. Please check the URL.");
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
