/* ============ TRACKER — Chefão Autopeças ============ */
var VISITOR_ID = localStorage.getItem('chefao-visitor');
if (!VISITOR_ID) {
  VISITOR_ID = 'v' + Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
  localStorage.setItem('chefao-visitor', VISITOR_ID);
}

var TRACK_API = '/.netlify/functions/track';

function trackEvent(eventName, data) {
  data = data || {};
  data.visitor_id = VISITOR_ID;
  try {
    fetch(TRACK_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: eventName, data: data, timestamp: Date.now() }),
    }).catch(function(){});
  } catch(e) {}
}

trackEvent('pageview', { path: window.location.pathname, referrer: document.referrer });
