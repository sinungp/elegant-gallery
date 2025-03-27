const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(express.static('public'));
app.use(fileUpload());
app.set('view engine', 'ejs');

// Create directories if they don't exist
const imagesPath = path.join(__dirname, 'public/uploads/images');
const videosPath = path.join(__dirname, 'public/uploads/videos');
fs.mkdirSync(imagesPath, { recursive: true });
fs.mkdirSync(videosPath, { recursive: true });

// Routes
app.get('/', (req, res) => {
    const images = fs.readdirSync(imagesPath).map(file => ({
        name: file,
        type: 'image'
    }));
    
    const videos = fs.readdirSync(videosPath).map(file => ({
        name: file,
        type: 'video'
    }));
    
    res.render('gallery', { images, videos });
});

// Upload endpoint
app.post('/upload', (req, res) => {
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
