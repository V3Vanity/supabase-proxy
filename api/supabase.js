export default async function handler(req, res) {
  const SUPABASE_URL = 'https://vimfydojltitzoibxsfn.supabase.co';
  
  // Получаем путь (убираем /api/supabase и добавляем оставшуюся часть)
  let path = req.url.replace('/api/supabase', '');
  
  // Если путь пустой, шлём запрос к health
  if (path === '' || path === '/') {
    path = '/auth/v1/health';
  }
  
  const fetchUrl = SUPABASE_URL + path;
  const method = req.method;
  
  console.log('🔄 Прокси:', method, fetchUrl);
  
  // CORS заголовки
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, Prefer, X-Client-Info',
    'Access-Control-Max-Age': '86400',
  };
  
  // Предзапрос OPTIONS
  if (method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }
  
  try {
    // Копируем заголовки, убирая проблемные
    const headers = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (['host', 'origin', 'referer', 'accept-encoding'].includes(key)) continue;
      headers[key] = value;
    }
    
    const fetchOptions = {
      method: method,
      headers: headers,
    };
    
    if (method !== 'GET' && method !== 'HEAD' && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }
    
    const response = await fetch(fetchUrl, fetchOptions);
    const data = await response.text();
    
    // Определяем Content-Type из ответа Supabase
    let contentType = 'application/json';
    if (response.headers.get('content-type')) {
      contentType = response.headers.get('content-type');
    }
    
    res.writeHead(response.status, {
      ...corsHeaders,
      'Content-Type': contentType,
    });
    res.end(data);
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
    res.writeHead(500, {
      ...corsHeaders,
      'Content-Type': 'application/json',
    });
    res.end(JSON.stringify({ error: error.message }));
  }
}
