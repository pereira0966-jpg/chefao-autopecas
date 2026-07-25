var crypto = require('crypto');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: 'Method Not Allowed' };

  try {
    var adminPassword = process.env.ADMIN_PASSWORD || 'chefao2025';
    var body = JSON.parse(event.body);
    var provided = body.password || '';

    if (provided !== adminPassword) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Senha incorreta' }) };
    }

    var today = new Date().toISOString().slice(0, 10);
    var token = crypto.createHash('sha256').update(adminPassword + ':' + today).digest('hex');

    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, token: token }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
