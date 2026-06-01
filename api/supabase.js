export default async function handler(req, res) {
  const SUPABASE_URL = 'https://vimfydojltitzoibxsfn.supabase.co';
  
  // Получаем путь запроса (убираем /api/supabase)
  let path = req.url.replace('/api/supabase', '');
  
  // Если путь пустой или / - добавляем /auth/v1/health для проверки
  if (path === '' || path === '/') {
    path = '/auth/v1/health';
  }
  
  const fetchUrl = SUPABASE_URL + path;
  const method = req.method;
  
  // CORS заголовки
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, Prefer, X-Client-Info',
    'Access-Control-Max-Age': '86400',
  };
  
  // Обработка OPTIONS (предзапрос)
  if (method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }
  
  try {
    console.log('Проксируем:', method, fetchUrl);
    
    // Подготавливаем заголовки
    const headers = {};
    for (let [key, value] of Object.entries(req.headers)) {
      // Пропускаем проблемные заголовки
      if (key === 'host' || key === 'origin' || key === 'referer') continue;
      headers[key] = value;
    }
    
    const fetchOptions = {
      method: method,
      headers: headers,
    };
    
    // Добавляем тело для методов, которые могут его иметь
    if (method !== 'GET' && method !== 'HEAD' && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }
    
    const response = await fetch(fetchUrl, fetchOptions);
    const data = await response.json();
    
    res.writeHead(response.status, {
      ...corsHeaders,
      'Content-Type': 'application/json',
    });
    res.end(JSON.stringify(data));
    
  } catch (error) {
    console.error('Proxy error:', error);
    res.writeHead(500, {
      ...corsHeaders,
      'Content-Type': 'application/json',
    });
    res.end(JSON.stringify({ error: error.message }));
  }
}
