const { getStore } = require('@netlify/blobs');
const crypto = require('crypto');

function validateToken(token) {
  if (!token) return false;
  var password = process.env.ADMIN_PASSWORD || 'chefao2025';
  var today = new Date().toISOString().slice(0, 10);
  var expected = crypto.createHash('sha256').update(password + ':' + today).digest('hex');
  var yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  var expectedYesterday = crypto.createHash('sha256').update(password + ':' + yesterday).digest('hex');
  return token === expected || token === expectedYesterday;
}

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'GET') return { statusCode: 405, headers, body: 'Method Not Allowed' };

  try {
    const params = event.queryStringParameters || {};
    if (!validateToken(params.token)) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Token invalido ou expirado' }) };
    }
    const days = parseInt(params.days, 10) || 30;
    const store = getStore('chefao-stats');

    const dates = [];
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().slice(0, 10));
    }

    const eventTypes = ['pageview', 'add_to_cart', 'remove_from_cart', 'checkout_open', 'purchase', 'register', 'login'];
    const result = { summary: {}, daily: {} };

    for (const date of dates) {
      result.daily[date] = {};
      for (const evt of eventTypes) {
        const countKey = 'count:' + date + ':' + evt;
        const raw = await store.get(countKey);
        result.daily[date][evt] = raw ? parseInt(raw, 10) : 0;
      }
    }

    result.summary.total_visitors = 0;
    result.summary.total_purchases = 0;
    result.summary.total_revenue = 0;
    result.summary.total_registrations = 0;
    const uniqueVisitors = new Set();

    for (const date of dates) {
      const { list } = await store.list({ prefix: date + ':purchase:' });
      for (const item of list) {
        const raw = await store.get(item.key);
        if (raw) {
          const rec = JSON.parse(raw);
          result.summary.total_purchases++;
          result.summary.total_revenue += parseFloat(rec.data.total || 0);
        }
      }
    }

    for (const date of dates) {
      const { list } = await store.list({ prefix: date + ':pageview:' });
      for (const item of list) {
        const raw = await store.get(item.key);
        if (raw) {
          const rec = JSON.parse(raw);
          if (rec.data.visitor_id) uniqueVisitors.add(rec.data.visitor_id);
        }
      }
    }
    result.summary.total_visitors = uniqueVisitors.size;

    for (const date of dates) {
      result.summary.total_registrations += result.daily[date].register || 0;
    }

    const last7 = dates.slice(0, 7);
    result.last7 = {};
    for (const evt of eventTypes) {
      result.last7[evt] = last7.reduce((sum, d) => sum + (result.daily[d][evt] || 0), 0);
    }
    result.last7.revenue = last7.reduce((sum, d) => {
      const dayPurchases = result.daily[d].purchase || 0;
      return sum + dayPurchases;
    }, 0);

    return { statusCode: 200, headers, body: JSON.stringify(result) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
