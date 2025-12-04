// server/index.js
const express = require('express');
const fetch = require('node-fetch');
const app = express();
app.use(express.json());
const HF_KEY = process.env.HF_API_KEY; // set in your server env

app.post('/api/ai', async (req, res) => {
  const prompt = req.body.prompt || '';
  try {
    const r = await fetch('https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill', {
      method:'POST',
      headers:{ Authorization:`Bearer ${HF_KEY}`, 'Content-Type':'application/json' },
      body: JSON.stringify({ inputs: prompt })
    });
    const j = await r.json();
    res.json(j);
  } catch(e){
    res.status(500).json({error: e.message});
  }
});

app.listen(process.env.PORT||3000);
