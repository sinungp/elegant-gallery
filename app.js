const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(express.static('public'));
app.use(fileUpload());
app.set('view engine', 'ejs');

// Create directories if not in Vercel environment
if (process.env.VERCEL !== '1') {
    const imagesPath = path.join(__dirname, 'public/uploads/images');
    const videosPath = path.join(__dirname, 'public/uploads/videos');
    fs.mkdirSync(imagesPath, { recursive: true });
    fs.mkdirSync(videosPath, { recursive: true });
}

// Routes
app.get('/', async (req, res) => {
    try {
        let images = [];
        let videos = [];

        if (process.env.VERCEL === '1') {
            // Untuk Vercel, gunakan temporary storage atau cloud storage
            // Contoh menggunakan array kosong untuk demo
            images = [];
            videos = [];
        } else {
            const imagesPath = path.join(__dirname, 'public/uploads/images');
            const videosPath = path.join(__dirname, 'public/uploads/videos');
            
            images = fs.readdirSync(imagesPath).map(file => ({
                name: file,
                type: 'image'
            }));
            
            videos = fs.readdirSync(videosPath).map(file => ({
                name: file,
                type: 'video'
            }));
        }
        
        res.render('gallery', { images, videos });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Upload endpoint
app.post('/upload', async (req, res) => {
    if (process.env.VERCEL === '1') {
        // Untuk Vercel, implementasikan cloud storage
        return res.status(200).send('Upload disabled in Vercel deployment');
    }

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    const file = req.files.media;
    const ext = path.extname(file.name).toLowerCase();
    const isVideo = ['.mp4', '.webm'].includes(ext);
    
    const uploadPath = path.join(__dirname, 'public/uploads',
        isVideo ? 'videos' : 'images',
        file.name
    );

    file.mv(uploadPath, (err) => {
        if (err) return res.status(500).send(err);
        res.redirect('/');
    });
});

// For Vercel serverless deployment
if (process.env.VERCEL === '1') {
    module.exports = app;
} else {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
