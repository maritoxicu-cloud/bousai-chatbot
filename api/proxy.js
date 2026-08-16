import axios from 'axios';

const API_KEY = process.env.API_KEY || 'bousai-api-key-prod-2024';
const BACKEND_URL = 'https://bousai-chatbot-production.up.railway.app';

export default async function handler(req, res) {
  // CORS ヘッダーを設定
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authorization ヘッダーから API キーを取得
    const auth_header = req.headers.authorization || '';
    const provided_key = auth_header.replace('Bearer ', '').trim();

    // API キーをチェック
    if (provided_key !== API_KEY) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    // リクエストボディからエンドポイントとデータを取得
    const { endpoint, data } = req.body;

    if (!endpoint) {
      return res.status(400).json({ error: 'Endpoint is required' });
    }

    // 対応するエンドポイントにプロキシ
    const response = await axios.post(`${BACKEND_URL}${endpoint}`, data, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    return res.status(error.response?.status || 500).json({
      error: error.message
    });
  }
}
