export default async function handler(req, res) {
  const SUPABASE_URL = 'https://vimfydojltitzoibxsfn.supabase.co';
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, apikey');
  
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  try {
    const path = req.url.replace('/api/supabase', '');
    const fetchUrl = SUPABASE_URL + path;
    
    const response = await fetch(fetchUrl, {
      method: req.method,
      headers: req.headers,
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });
    
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
