export default async function handler(req, res) {
  // Supabase URL
  const SUPABASE_URL = 'https://vimfydojltitzoibxsfn.supabase.co';
  
  // Получаем путь из запроса
  const fullUrl = req.url;
  // Убираем /api/supabase из пути, оставляем остальное
  let path = fullUrl.replace('/api/supabase', '');
  
  // Если путь пустой, отправляем корневой запрос
  if (!path || path === '/') {
    path = '';
  }
  
  const targetUrl = SUPABASE_URL + path;
  
  console.log(`Прокси: ${req.method} ${targetUrl}`);
  
  // Устанавливаем CORS заголовки
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, apikey');
  
  // Обработка предзапроса OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  try {
    // Подготавливаем заголовки для запроса к Supabase
    const headers = {
      'apikey': req.headers.apikey,
      'Authorization': req.headers.authorization,
      'Content-Type': req.headers['content-type'] || 'application/json',
    };
    
    // Опции для fetch
    const fetchOptions = {
      method: req.method,
      headers: headers,
    };
    
    // Добавляем тело запроса для POST/PUT/PATCH
    if (req.method !== 'GET' && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }
    
    // Отправляем запрос к Supabase
    const response = await fetch(targetUrl, fetchOptions);
    const data = await response.json();
    
    // Отправляем ответ клиенту
    res.status(response.status).json(data);
    
  } catch (error) {
    console.error('Ошибка прокси:', error);
    res.status(500).json({ error: error.message });
  }
}
