const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const API_KEY = 'bousai-api-key-prod-2024';
const BACKEND_URL = 'https://bousai-chatbot-production.up.railway.app';

// POST /api/proxy - 従来型プロキシ（endpoint + data を受け取る）
app.post('/api/proxy', async (req, res) => {
  try {
    const { endpoint, data } = req.body;

    if (!endpoint) {
      return res.status(400).json({ error: 'No endpoint provided' });
    }

    const response = await axios.post(`${BACKEND_URL}${endpoint}`, data, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(error.response?.status || 500).json({
      error: error.message
    });
  }
});

// すべての /api/* リクエストを直接プロキシ（GETなど）
app.all(/^\/api\//, async (req, res) => {
  try {
    const path = req.path;
    const queryString = Object.keys(req.query).length > 0
      ? '?' + new URLSearchParams(req.query).toString()
      : '';

    const fullUrl = `${BACKEND_URL}${path}${queryString}`;

    const config = {
      method: req.method,
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      config.data = req.body;
    }

    const response = await axios(fullUrl, config);
    res.json(response.data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(error.response?.status || 500).json({
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});