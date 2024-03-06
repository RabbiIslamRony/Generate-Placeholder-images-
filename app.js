const express = require('express');
const path = require('path');
const multer = require('multer');
const bodyParser = require('body-parser');
const Jimp = require('jimp');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  try {
    const imageBuffer = req.file.buffer;
    const originalImage = await Jimp.read(imageBuffer);

    // Create a placeholder image with the same dimensions as the original image
    const placeholderImage = new Jimp(originalImage.getWidth(), originalImage.getHeight(), '#cccccc');

    // Convert the placeholder image to a buffer
    const placeholderBuffer = await placeholderImage.getBufferAsync(Jimp.MIME_PNG);

    // Encode the placeholder image buffer to base64
    const placeholderBase64 = placeholderBuffer.toString('base64');

    // Send the base64 data and original image size to the client
    res.send({
      placeholderBase64: placeholderBase64,
      originalSize: {
        width: originalImage.getWidth(),
        height: originalImage.getHeight(),
      },
    });
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/download', async (req, res) => {
  try {
    const placeholderImage = new Jimp(100, 100, '#cccccc');
    const placeholderBuffer = await placeholderImage.getBufferAsync(Jimp.MIME_PNG);

    res.setHeader('Content-Disposition', 'attachment; filename=placeholder.png');
    res.setHeader('Content-Type', Jimp.MIME_PNG);
    res.send(placeholderBuffer);
  } catch (error) {
    console.error('Error creating placeholder image:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
