const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Routes
app.post('/api/extract-colors', async (req, res) => {
  try {
    const { url } = req.body;
    
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `**Analyze the logo of the company associated with the URL ${url}.**

    **Identify the primary colors used in the logo.** Prioritize colors that are dominant, distinct, and visually striking.
    
    **If you cannot access the logo directly, search for it online.** Use a reliable image search engine and ensure the results are accurate and representative of the brand's official logo.
    
    **Return the results as a JSON array of objects, where each object contains the color's hex code and RGB values.** For example:
    
    [{"hex": "#FF0000", "rgb": "rgb(255, 0, 0)"}, ...]`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Remove any non-JSON content and parse
    const jsonString = text.replace(/^[\s\S]*?\[/, '[').replace(/\][\s\S]*$/, ']');
    
    try {
      const colors = JSON.parse(jsonString);
      res.json(colors);
    } catch (error) {
      console.error('Error parsing colors:', error);
      res.status(500).json({ error: 'An error occurred while parsing colors' });
    }
  } catch (error) {
    console.error('Error extracting colors:', error);
    res.status(500).json({ error: 'An error occurred while extracting colors' });
  }
});

// Start the server
app.listen(process.env.PORT, () => {
  console.log('Server is running');
});