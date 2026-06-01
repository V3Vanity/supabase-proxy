export default async function handler(req, res) {
  const SUPABASE_URL = 'https://vimfydojltitzoibxsfn.supabase.co';
  
  // Получаем путь запроса
  const url = req.url;
  const path = url.replace('/api/supabase', '');
  const fetchUrl = SUPABASE_URL + path;
  
  // Метод запроса
  const method = req.method;
  
  // CORS заголовки — расширенные
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, Prefer, X-Client-Info, X-Client-Info-Version',
    'Access-Control-Max-Age': '86400',
  };
  
  // Обработка OPTIONS (предзапрос)
  if (method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }
  
  try {
    // Подготавливаем заголовки для запроса к Supabase
    const headers = {};
    for (let [key, value] of Object.entries(req.headers)) {
      if (key === 'host' || key === 'origin' || key === 'referer') continue;
      headers[key] = value;
    }
    
    // Параметры запроса
    const fetchOptions = {
      method: method,
      headers: headers,
    };
    
    // Добавляем тело для POST/PUT/PATCH
    if (method !== 'GET' && method !== 'HEAD' && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }
    
    // Отправляем запрос к Supabase
    const response = await fetch(fetchUrl, fetchOptions);
    const data = await response.json();
    
    // Отправляем ответ с CORS
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
