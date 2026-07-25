/* ============ PAGAMENTO — Chefão Autopeças ============ */
/* MOCK_MODE: true = simulação, false = Mercado Pago real */
var MOCK_MODE = true;
var MP_ACCESS_TOKEN = '';
var paymentModalOpen = false;

function openCheckout() {
    var cart = window._getCart ? window._getCart() : [];
    if (!cart.length) { showToast('Carrinho vazio'); return; }
    var modal = document.getElementById('checkoutModal');
    var overlay = document.getElementById('checkoutOverlay');
    if (!modal || !overlay) return;
    overlay.style.display = 'block';
    modal.style.display = 'flex';
    paymentModalOpen = true;
    renderCheckoutSummary();
    switchTab('pix');
    document.body.style.overflow = 'hidden';
}

function closeCheckout() {
    var modal = document.getElementById('checkoutModal');
    var overlay = document.getElementById('checkoutOverlay');
    if (modal) modal.style.display = 'none';
    if (overlay) overlay.style.display = 'none';
    paymentModalOpen = false;
    document.body.style.overflow = '';
}

function renderCheckoutSummary() {
    var cart = window._getCart ? window._getCart() : [];
    var el = document.getElementById('checkoutSummary');
    if (!el) return;
    var total = 0, html = '';
    cart.forEach(function(p){
        var pr = p.preco_promocional || p.preco;
        total += parseFloat(pr) * (p.qty||1);
        html += '<div class="chk-item"><span class="chk-item-name">'+p.nome+' <small>x'+p.qty+'</small></span><span class="chk-item-price">R$ '+(parseFloat(pr)*(p.qty||1)).toFixed(2)+'</span></div>';
    });
    html += '<div class="chk-total"><span>Total</span><span>R$ '+total.toFixed(2)+'</span></div>';
    el.innerHTML = html;
}

function switchTab(method) {
    document.querySelectorAll('.chk-tab').forEach(function(t){ t.classList.remove('active'); });
    document.querySelectorAll('.chk-panel').forEach(function(p){ p.classList.remove('active'); });
    var tab = document.querySelector('.chk-tab[data-method="'+method+'"]');
    var panel = document.getElementById('chkPanel'+method.charAt(0).toUpperCase()+method.slice(1));
    if (tab) tab.classList.add('active');
    if (panel) { panel.classList.add('active'); }
    if (method === 'pix') gerarMockPix();
    if (method === 'card') calcularParcelas();
    if (method === 'boleto') gerarMockBoleto();
}

function gerarMockPix() {
    var cart = window._getCart ? window._getCart() : [];
    var total = cart.reduce(function(s,p){ return s + parseFloat(p.preco_promocional||p.preco)*(p.qty||1); }, 0);
    var pixCode = '00020126580014BR.GOV.BCB.PIX0136'+Math.random().toString(36).substring(2,15)+'chefaoautopecas'+'52040000530398654'+total.toFixed(2).replace('.','')+'5802BR5925Chefao Autopecas Ltda6008BRASILIA62070503***6304ABCD';
    document.getElementById('pixCodeDisplay').value = pixCode;
    document.getElementById('pixValue').textContent = 'R$ '+total.toFixed(2);
    var qrContainer = document.getElementById('pixQRCode');
    if (MOCK_MODE) {
        qrContainer.innerHTML = '<div style="width:200px;height:200px;margin:0 auto;background:white;border:2px solid #ddd;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:12px;color:#999;flex-direction:column;gap:8px"><i class="fas fa-qrcode" style="font-size:64px;color:#333"></i><span>QR Code Simulado</span></div>';
    } else {
        qrContainer.innerHTML = '<div style="width:200px;height:200px;margin:0 auto;background:#f9f9f9;border-radius:12px;display:flex;align-items:center;justify-content:center"><i class="fas fa-spinner fa-spin" style="font-size:30px;color:#999"></i></div>';
    }
    document.getElementById('pixStatus').innerHTML = '<span style="color:#999;font-size:13px"><i class="fas fa-clock"></i> Aguardando pagamento...</span>';
}

function copiarPix() {
    var el = document.getElementById('pixCodeDisplay');
    if (!el) return;
    el.select(); el.setSelectionRange(0,99999);
    try { document.execCommand('copy'); showToast('Código PIX copiado!'); } catch(e) { showToast('Copie manualmente'); }
}

function simularPagamentoPix() {
    document.getElementById('pixStatus').innerHTML = '<span style="color:var(--success);font-size:14px;font-weight:600"><i class="fas fa-check-circle"></i> Pagamento confirmado!</span>';
    showToast('Pagamento confirmado!');
    finalizarPedido('PIX', 'MOCK-'+Date.now());
}

var selectedParcela = 1;

function calcularParcelas() {
    var cart = window._getCart ? window._getCart() : [];
    var total = cart.reduce(function(s,p){ return s + parseFloat(p.preco_promocional||p.preco)*(p.qty||1); }, 0);
    var container = document.getElementById('chkParcelas');
    if (!container) return;
    var maxParcelas = 6;
    var pixTotal = total * 0.95;
    var html = '';
    for (var i = 1; i <= maxParcelas; i++) {
        var val = (total / i);
        var ativo = i === 1 ? ' active' : '';
        html += '<div class="chk-parc-row'+ativo+'" data-parc="'+i+'" onclick="selectParcela('+i+')">'+
            '<span class="chk-parc-qty">'+i+'x</span>'+
            '<span class="chk-parc-val">R$ '+val.toFixed(2)+'</span>'+
            '<span class="chk-parc-total">R$ '+total.toFixed(2)+'</span>'+
            (i === 1 ? '<span class="chk-parc-badge">à vista</span>' : '<span class="chk-parc-badge">s/ juros</span>')+
        '</div>';
    }
    html += '<div class="chk-parc-row chk-parc-pix" onclick="selectParcela(0)" data-parc="0">'+
        '<span class="chk-parc-qty"><i class="fas fa-qrcode"></i></span>'+
        '<span class="chk-parc-val">R$ '+pixTotal.toFixed(2)+'</span>'+
        '<span class="chk-parc-total">R$ '+pixTotal.toFixed(2)+'</span>'+
        '<span class="chk-parc-badge">PIX 5% off</span>'+
    '</div>';
    container.innerHTML = html;
    selectedParcela = 1;
}

function selectParcela(parc) {
    document.querySelectorAll('.chk-parc-row').forEach(function(r){ r.classList.remove('active'); });
    var el = document.querySelector('.chk-parc-row[data-parc="'+parc+'"]');
    if (el) el.classList.add('active');
    selectedParcela = parc;
}

function processarCartao() {
    var nome = document.getElementById('chkCardName').value.trim();
    var num = document.getElementById('chkCardNumber').value.replace(/\s/g,'');
    var val = document.getElementById('chkCardExpiry').value.trim();
    var cvv = document.getElementById('chkCardCVV').value.trim();
    if (!nome || num.length < 16 || !val || cvv.length < 3) {
        showToast('Preencha todos os dados do cartão'); return;
    }
    if (MOCK_MODE) {
        var parcela = selectedParcela;
        if (parcela === 0) {
            document.getElementById('cardStatus').innerHTML = '<div style="text-align:center;padding:20px"><i class="fas fa-check-circle" style="font-size:48px;color:var(--success);margin-bottom:12px;display:block"></i><h4 style="color:var(--success);margin-bottom:6px">Pagamento PIX aprovado!</h4><p style="color:#666;font-size:13px">Pagamento no PIX com 5% de desconto confirmado.</p><p style="color:#999;font-size:11px">Transação: MOCK-'+Date.now()+'</p></div>';
            showToast('Pagamento PIX aprovado!');
            setTimeout(function(){ finalizarPedido('PIX (cartão)', 'MOCK-'+Date.now()); }, 2000);
            return;
        }
        document.getElementById('cardStatus').innerHTML = '<div style="text-align:center;padding:20px"><i class="fas fa-check-circle" style="font-size:48px;color:var(--success);margin-bottom:12px;display:block"></i><h4 style="color:var(--success);margin-bottom:6px">Cartão aprovado!</h4><p style="color:#666;font-size:13px">Pagamento em '+parcela+'x de R$ '+(calcularTotalCartao()/parcela).toFixed(2)+' aprovado.</p><p style="color:#999;font-size:11px">Transação: MOCK-'+Date.now()+'</p></div>';
        showToast('Cartão aprovado!');
        setTimeout(function(){ finalizarPedido('Cartão', 'MOCK-'+Date.now()); }, 2000);
    } else {
        document.getElementById('cardStatus').innerHTML = '<p style="text-align:center;color:#999"><i class="fas fa-spinner fa-spin"></i> Processando...</p>';
    }
}

function calcularTotalCartao() {
    var cart = window._getCart ? window._getCart() : [];
    return cart.reduce(function(s,p){ return s + parseFloat(p.preco_promocional||p.preco)*(p.qty||1); }, 0);
}

function gerarMockBoleto() {
    var cart = window._getCart ? window._getCart() : [];
    var total = cart.reduce(function(s,p){ return s + parseFloat(p.preco_promocional||p.preco)*(p.qty||1); }, 0);
    var boletoCode = '34191.23456 67890.123456 78901.234567 1 '+Date.now().toString().slice(-8);
    document.getElementById('boletoCode').textContent = boletoCode;
    document.getElementById('boletoValue').textContent = 'R$ '+total.toFixed(2);
    document.getElementById('boletoDueDate').textContent = new Date(Date.now()+3*86400000).toLocaleDateString('pt-BR');
    document.getElementById('boletoStatus').innerHTML = '<span style="color:#999;font-size:13px"><i class="fas fa-clock"></i> Aguardando pagamento...</span>';
}

function downloadBoleto() {
    showToast('Boleto gerado (simulação)');
}

function finalizarPedido(metodo, transacaoId) {
    var cart = window._getCart ? window._getCart() : [];
    var total = cart.reduce(function(s,p){ return s + parseFloat(p.preco_promocional||p.preco)*(p.qty||1); }, 0);
    var order = { id: 'P'+(Date.now()+'').slice(-8), date: new Date().toLocaleString('pt-BR'), items: JSON.parse(JSON.stringify(cart)), total: total, metodo: metodo, transacao: transacaoId };
    var orders = JSON.parse(localStorage.getItem('chefao-v3-orders') || '[]');
    orders.push(order);
    localStorage.setItem('chefao-v3-orders', JSON.stringify(orders));
    var msg = 'Pedido confirmado!%0A%0A';
    msg += 'Pedido #'+order.id+'%0A';
    msg += 'Pagamento: '+metodo+'%0A';
    msg += 'Transação: '+transacaoId+'%0A%0A';
    cart.forEach(function(p){ var pr = p.preco_promocional || p.preco; msg += '- '+p.nome+' (x'+p.qty+') - R$ '+(parseFloat(pr)*p.qty).toFixed(2)+'%0A'; });
    msg += '%0ATotal: R$ '+total.toFixed(2)+'%0A%0AObrigado por comprar na Chefão Autopeças!';
    window.open('https://wa.me/5521994325697?text='+msg,'_blank');
    if (window._clearCart) window._clearCart();
    closeCheckout();
}

function maskCardNumber(el) {
    var v = el.value.replace(/\D/g,'').substring(0,16);
    el.value = v.replace(/(\d{4})(?=\d)/g,'$1 ');
}
function maskExpiry(el) {
    var v = el.value.replace(/\D/g,'').substring(0,4);
    if (v.length > 2) v = v.substring(0,2)+'/'+v.substring(2);
    el.value = v;
}
function maskCVV(el) {
    el.value = el.value.replace(/\D/g,'').substring(0,4);
}

function setupPaymentBridge() {
    window._getCart = function(){ return window.cart || []; };
    window._clearCart = function(){ window.cart = []; if (window.saveCart) window.saveCart(); };
}

document.addEventListener('DOMContentLoaded', function(){
    setupPaymentBridge();
});

window.openCheckout = openCheckout;
window.closeCheckout = closeCheckout;
window.switchTab = switchTab;
window.copiarPix = copiarPix;
window.simularPagamentoPix = simularPagamentoPix;
window.calcularParcelas = calcularParcelas;
window.processarCartao = processarCartao;
window.downloadBoleto = downloadBoleto;
window.maskCardNumber = maskCardNumber;
window.maskExpiry = maskExpiry;
window.maskCVV = maskCVV;
window.selectParcela = selectParcela;
