export default async function handler(req, res) {
  const SUPABASE_URL = 'https://vimfydojltitzoibxsfn.supabase.co';
  
  // Получаем путь
  let path = req.url.replace('/api/supabase', '');
  if (path === '' || path === '/') {
    path = '/auth/v1/health';
  }
  
  const fetchUrl = SUPABASE_URL + path;
  const method = req.method;
  
  // ==== ОБЯЗАТЕЛЬНЫЕ CORS ЗАГОЛОВКИ ====
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, apikey, Prefer, X-Client-Info, X-Client-Info-Version');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // Обработка предзапроса OPTIONS
  if (method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  try {
    // Копируем заголовки, удаляя проблемные
    const headers = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (['host', 'origin', 'referer', 'accept-encoding', 'connection'].includes(key)) continue;
      headers[key] = value;
    }
    
    const fetchOptions = {
      method: method,
      headers: headers,
    };
    
    // Добавляем тело для не-GET запросов
    if (method !== 'GET' && method !== 'HEAD' && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }
    
    console.log('Прокси:', method, fetchUrl);
    
    const response = await fetch(fetchUrl, fetchOptions);
    const data = await response.text();
    
    // Определяем тип контента
    const contentType = response.headers.get('content-type') || 'application/json';
    
    res.setHeader('Content-Type', contentType);
    res.status(response.status).send(data);
    
  } catch (error) {
    console.error('Ошибка:', error);
    res.status(500).json({ error: error.message });
  }
}
