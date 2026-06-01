export default async function handler(req, res) {
  const SUPABASE_URL = 'https://vimfydojltitzoibxsfn.supabase.co';
  
  // Получаем путь из запроса
  let path = req.url;
  
  // Убираем /api/supabase из начала пути
  if (path.startsWith('/api/supabase')) {
    path = path.replace('/api/supabase', '');
  }
  
  // Если путь пустой или /, отправляем на /auth/v1/health
  if (!path || path === '/') {
    path = '/auth/v1/health';
  }
  
  const targetUrl = SUPABASE_URL + path;
  const method = req.method;
  
  console.log(`📡 Прокси: ${method} ${targetUrl}`);
  
  // CORS заголовки — обязательные
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, apikey, Prefer, X-Client-Info');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // Обработка предзапроса OPTIONS
  if (method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  
  try {
    // Подготавливаем заголовки для Supabase
    const headers = {};
    
    // Копируем только нужные заголовки
    if (req.headers.apikey) headers['apikey'] = req.headers.apikey;
    if (req.headers.authorization) headers['Authorization'] = req.headers.authorization;
    if (req.headers['content-type']) headers['Content-Type'] = req.headers['content-type'];
    
    const fetchOptions = {
      method: method,
      headers: headers,
    };
    
    // Добавляем тело для POST/PUT/PATCH
    if (method !== 'GET' && method !== 'HEAD' && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }
    
    const response = await fetch(targetUrl, fetchOptions);
    const data = await response.json();
    
    res.status(response.status).json(data);
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
    res.status(500).json({ error: error.message });
  }
}
