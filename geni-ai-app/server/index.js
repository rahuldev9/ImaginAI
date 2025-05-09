const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");
require("dotenv").config();
const fs = require('fs');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = 5000;

const HF_API_TOKEN = process.env.HF_API_TOKEN;

const HF_TRANSCRIBE_MODEL =  process.env.HF_TRANSCRIBE_MODEL;
const HF_IMAGE_MODEL = process.env.HF_IMAGE_MODEL;
app.use(cors());
app.use(bodyParser.json());
const upload = multer({ dest: 'uploads/' });

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.flac': 'audio/flac',
    '.m4a': 'audio/x-m4a',
    '.ogg': 'audio/ogg',
    '.webm': 'audio/webm',
  };
  return mimeTypes[ext] || 'audio/mpeg';
}


app.post('/transcribe-and-translate', upload.single('audio'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const contentType = getMimeType(filePath);
    const audioData = fs.readFileSync(filePath);

    const transcribeRes = await axios.post(
      `https://api-inference.huggingface.co/models/${HF_TRANSCRIBE_MODEL}`,
      audioData,
      {
        headers: {
          Authorization: `Bearer ${HF_API_TOKEN}`,
          'Content-Type': contentType,
          Accept: 'application/json',
        },
        maxBodyLength: Infinity,
      }
    );

    const englishText = transcribeRes.data.text || transcribeRes.data;
    console.log('📝 Transcription:', englishText);
    fs.unlinkSync(filePath);
    res.json({ transcription: englishText });

  } catch (error) {
    console.error('❌ Transcription error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to transcribe/translate the audio.' });
  }
});


app.post("/generate-image", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Invalid prompt format." });
  }

  try {
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${HF_IMAGE_MODEL}`,
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${HF_API_TOKEN}`,
          "Content-Type": "application/json",
          "Accept": "image/png",  
        },
        responseType: "arraybuffer", 
        validateStatus: () => true,  
      }
    );


    const contentType = response.headers["content-type"];

    if (!contentType || !contentType.includes("image")) {
      const errorMessage = Buffer.from(response.data, "binary").toString();
      console.error("Model did not return an image:", errorMessage);
      return res.status(500).json({ error: "Model returned non-image data", details: errorMessage });
    }

    const base64Image = Buffer.from(response.data, "binary").toString("base64");
    res.json({ imageUrl: `data:${contentType};base64,${base64Image}` });

  } catch (err) {
    console.error("Image generation failed:", err.message);
    res.status(500).json({ error: "Failed to generate image", message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
