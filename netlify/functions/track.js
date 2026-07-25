const { getStore } = require('@netlify/blobs');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: 'Method Not Allowed' };

  try {
    const { event: eventName, data = {}, timestamp = Date.now() } = JSON.parse(event.body);
    const store = getStore('chefao-stats');
    const dateKey = new Date().toISOString().slice(0, 10);
    const key = dateKey + ':' + eventName + ':' + timestamp;

    const record = JSON.stringify({ event: eventName, data, timestamp, date: dateKey });
    await store.set(key, record);

    const countKey = 'count:' + dateKey + ':' + eventName;
    const countRaw = await store.get(countKey);
    const count = countRaw ? parseInt(countRaw, 10) : 0;
    await store.set(countKey, String(count + 1));

    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
