const express = require('express');
const path = require('path');
const multer = require('multer');
const bodyParser = require('body-parser');
const Jimp = require('jimp');
const archiver = require('archiver');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json({ limit: '30mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '30mb' }));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

let processedImages = []; // Store processed images globally

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/upload', upload.array('images', 20), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send('No files uploaded.');
  }

  try {
    processedImages = [];

    for (const file of req.files) {
      const originalImage = await Jimp.read(file.buffer);

      // Create a placeholder image with the same dimensions as the original image
      const placeholderImage = new Jimp(originalImage.getWidth(), originalImage.getHeight(), '#cccccc');

      // Convert the placeholder image to a buffer
      const placeholderBuffer = await placeholderImage.getBufferAsync(Jimp.MIME_PNG);

      // Encode the placeholder image buffer to base64
      const placeholderBase64 = placeholderBuffer.toString('base64');

      // Store the processed image details
      processedImages.push({
        placeholderBase64: placeholderBase64,
        originalSize: {
          width: originalImage.getWidth(),
          height: originalImage.getHeight(),
        },
      });
    }

    // Send the processed images data to the client
    res.send(processedImages);
  } catch (error) {
    console.error('Error processing images:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/download-all', async (req, res) => {
  try {
    const archive = archiver('zip', { zlib: { level: 9 } });

    // Set content-type to zip
    res.header('Content-Type', 'application/zip');

    // Set content-disposition to force download
    res.attachment('placeholders.zip');

    archive.pipe(res);

    processedImages.forEach((imageData, index) => {
      const buffer = Buffer.from(imageData.placeholderBase64, 'base64');
      archive.append(buffer, { name: `placeholder_${index + 1}.png` });
    });

    archive.finalize();
  } catch (error) {
    console.error('Error creating zip file:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
