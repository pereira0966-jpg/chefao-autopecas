document.addEventListener('DOMContentLoaded', function() { 'use strict';

    /* ============ STATIC DATA ============ */
    var STATIC_CATEGORIES = [
        {id:1,nome:'Baterias',slug:'baterias',total:8},{id:2,nome:'Suspensao',slug:'suspensao',total:10},
        {id:3,nome:'Freios',slug:'freios',total:12},{id:4,nome:'Oleos e Filtros',slug:'oleos-e-filtros',total:8},
        {id:5,nome:'Motor e Direcao',slug:'motor-e-direcao',total:9},{id:6,nome:'Palhetas e Acessorios',slug:'palhetas-acessorios',total:7},
        {id:7,nome:'Iluminacao',slug:'iluminacao',total:6},{id:8,nome:'Peças Importadas',slug:'pecas-importadas',total:5},
        {id:9,nome:'Servicos',slug:'servicos',total:4}
    ];
    var STATIC_PRODUCTS = [
        {id:1,nome:'Bateria 60Ah Cral — Gol/Fox/Polo',codigo:'BT-001',categoria_id:1,categoria_nome:'Baterias',descricao_curta:'Bateria automotiva 60Ah alta durabilidade',preco:349.90,preco_promocional:299.90,icone:'fas fa-bolt',estoque:15,nota_media:4.8,destaque:1},
        {id:2,nome:'Bateria 45Ah — Uno/Mobi/Onix',codigo:'BT-002',categoria_id:1,categoria_nome:'Baterias',descricao_curta:'Bateria compacta 45Ah veiculos de entrada',preco:269.90,preco_promocional:null,icone:'fas fa-bolt',estoque:20,nota_media:4.5,destaque:0},
        {id:3,nome:'Bateria 70Ah Zetta — Corolla/Civic',codigo:'BT-003',categoria_id:1,categoria_nome:'Baterias',descricao_curta:'Bateria 70Ah alto desempenho',preco:449.90,preco_promocional:399.90,icone:'fas fa-bolt',estoque:8,nota_media:4.7,destaque:1},
        {id:4,nome:'Bateria 100Ah — Hilux/S10',codigo:'BT-004',categoria_id:1,categoria_nome:'Baterias',descricao_curta:'Bateria pesada para caminhonetes',preco:799.90,preco_promocional:699.90,icone:'fas fa-bolt',estoque:3,nota_media:4.9,destaque:1},
        {id:5,nome:'Bateria Heliar 50Ah — Strada/Saveiro',codigo:'BT-005',categoria_id:1,categoria_nome:'Baterias',descricao_curta:'Bateria Heliar premium 50Ah',preco:319.90,preco_promocional:279.90,icone:'fas fa-bolt',estoque:12,nota_media:4.6},
        {id:6,nome:'Bateria Moura 75Ah — Cruze/Focus',codigo:'BT-006',categoria_id:1,categoria_nome:'Baterias',descricao_curta:'Bateria Moura 75Ah premium',preco:529.90,preco_promocional:479.90,icone:'fas fa-bolt',estoque:6,nota_media:4.8},
        {id:10,nome:'Amortecedor Dianteiro — Gol G5/G6',codigo:'SP-001',categoria_id:2,categoria_nome:'Suspensao',descricao_curta:'Amortecedor hidraulico dianteiro Gol',preco:199.90,preco_promocional:179.90,icone:'fas fa-car',estoque:10,nota_media:4.5,destaque:1},
        {id:11,nome:'Kit Amortecedor Traseiro — Gol',codigo:'SP-002',categoria_id:2,categoria_nome:'Suspensao',descricao_curta:'Par de amortecedores traseiros Gol',preco:219.90,preco_promocional:null,icone:'fas fa-car',estoque:14,nota_media:4.4},
        {id:12,nome:'Amortecedor Diant. Cofap — Onix/Prisma',codigo:'SP-003',categoria_id:2,categoria_nome:'Suspensao',descricao_curta:'Amortecedor Cofap original Onix',preco:249.90,preco_promocional:219.90,icone:'fas fa-car',estoque:7,nota_media:4.7,destaque:1},
        {id:13,nome:'Bandeja Dianteira — Gol G5',codigo:'SP-004',categoria_id:2,categoria_nome:'Suspensao',descricao_curta:'Bandeja suspensao dianteira Gol G5',preco:159.90,preco_promocional:139.90,icone:'fas fa-car',estoque:5,nota_media:4.3},
        {id:14,nome:'Bieleta Dianteira — Fox/Polo',codigo:'SP-005',categoria_id:2,categoria_nome:'Suspensao',descricao_curta:'Bieleta estabilizadora Fox/Polo',preco:89.90,preco_promocional:69.90,icone:'fas fa-car',estoque:18,nota_media:4.6},
        {id:15,nome:'Kit 4 Amortecedores — Corolla 2014-2018',codigo:'SP-006',categoria_id:2,categoria_nome:'Suspensao',descricao_curta:'Kit completo 4 amortecedores Corolla',preco:899.90,preco_promocional:799.90,icone:'fas fa-car',estoque:4,nota_media:4.8,destaque:1},
        {id:20,nome:'Pastilha de Freio — Uno Way 1.4',codigo:'FR-001',categoria_id:3,categoria_nome:'Freios',descricao_curta:'Pastilha freio dianteira Uno Way',preco:79.90,preco_promocional:69.90,icone:'fas fa-stop-circle',estoque:22,nota_media:4.5,destaque:1},
        {id:21,nome:'Pastilha de Freio — Gol G5/G6',codigo:'FR-002',categoria_id:3,categoria_nome:'Freios',descricao_curta:'Pastilha freio dianteira Gol G5',preco:89.90,preco_promocional:79.90,icone:'fas fa-stop-circle',estoque:16,nota_media:4.6,destaque:1},
        {id:22,nome:'Disco de Freio Ventilado — Gol/Fox',codigo:'FR-003',categoria_id:3,categoria_nome:'Freios',descricao_curta:'Disco freio ventilado original Gol/Fox',preco:129.90,preco_promocional:null,icone:'fas fa-compact-disc',estoque:12,nota_media:4.4},
        {id:23,nome:'Disco de Freio — Onix 2012-2019',codigo:'FR-004',categoria_id:3,categoria_nome:'Freios',descricao_curta:'Disco freio dianteiro Onix',preco:149.90,preco_promocional:129.90,icone:'fas fa-compact-disc',estoque:9,nota_media:4.7},
        {id:24,nome:'Pastilha Traseira — HB20 2013-2020',codigo:'FR-005',categoria_id:3,categoria_nome:'Freios',descricao_curta:'Pastilha freio traseira HB20',preco:69.90,preco_promocional:59.90,icone:'fas fa-stop-circle',estoque:20,nota_media:4.3},
        {id:25,nome:'Kit Completo Freio Dianteiro — Gol',codigo:'FR-006',categoria_id:3,categoria_nome:'Freios',descricao_curta:'Kit pastilhas + discos dianteiros Gol',preco:299.90,preco_promocional:259.90,icone:'fas fa-stop-circle',estoque:8,nota_media:4.8,destaque:1},
        {id:30,nome:'Oleo Motor 5W30 Sintetico 1L',codigo:'OL-001',categoria_id:4,categoria_nome:'Oleos e Filtros',descricao_curta:'Oleo sintetico 5W30 motores flex',preco:39.90,preco_promocional:34.90,icone:'fas fa-tint',estoque:30,nota_media:4.6,destaque:1},
        {id:31,nome:'Oleo Motor 20W50 Mineral 1L',codigo:'OL-002',categoria_id:4,categoria_nome:'Oleos e Filtros',descricao_curta:'Oleo mineral 20W50 motores antigos',preco:29.90,preco_promocional:null,icone:'fas fa-tint',estoque:40,nota_media:4.3},
        {id:32,nome:'Filtro de Oleo — Gol/Uno/Onix',codigo:'FL-001',categoria_id:4,categoria_nome:'Oleos e Filtros',descricao_curta:'Filtro oleo universal populares',preco:24.90,preco_promocional:null,icone:'fas fa-filter',estoque:50,nota_media:4.5},
        {id:33,nome:'Filtro de Ar — Gol G5/Fox',codigo:'FL-002',categoria_id:4,categoria_nome:'Oleos e Filtros',descricao_curta:'Filtro ar motor Gol G5/Fox',preco:34.90,preco_promocional:29.90,icone:'fas fa-filter',estoque:28,nota_media:4.4},
        {id:34,nome:'Filtro de Combustivel — Fiat Palio',codigo:'FL-003',categoria_id:4,categoria_nome:'Oleos e Filtros',descricao_curta:'Filtro combustivel Fiat Palio',preco:19.90,preco_promocional:16.90,icone:'fas fa-filter',estoque:35,nota_media:4.2},
        {id:35,nome:'Oleo 10W40 Semi-Sintetico Castrol 1L',codigo:'OL-003',categoria_id:4,categoria_nome:'Oleos e Filtros',descricao_curta:'Castrol semi-sintetico 10W40 1L',preco:44.90,preco_promocional:39.90,icone:'fas fa-tint',estoque:22,nota_media:4.7,destaque:1},
        {id:40,nome:'Homocinetica Completa — Gol/Fox',codigo:'MD-001',categoria_id:5,categoria_nome:'Motor e Direcao',descricao_curta:'Homocinetica completa Gol/Fox',preco:189.90,preco_promocional:159.90,icone:'fas fa-cog',estoque:7,nota_media:4.5,destaque:1},
        {id:41,nome:'Caixa de Direcao — Gol G5/G6',codigo:'MD-002',categoria_id:5,categoria_nome:'Motor e Direcao',descricao_curta:'Caixa direcao mecanica Gol G5',preco:459.90,preco_promocional:399.90,icone:'fas fa-cogs',estoque:4,nota_media:4.6,destaque:1},
        {id:42,nome:'Correia Dentada + Tensor — Onix 1.0',codigo:'MD-003',categoria_id:5,categoria_nome:'Motor e Direcao',descricao_curta:'Kit correia dentada + tensor Onix',preco:189.90,preco_promocional:169.90,icone:'fas fa-cog',estoque:10,nota_media:4.7,destaque:1},
        {id:43,nome:'Bomba d\'Agua — Gol/Fox 1.0',codigo:'MD-004',categoria_id:5,categoria_nome:'Motor e Direcao',descricao_curta:'Bomba agua original Gol/Fox 1.0',preco:129.90,preco_promocional:109.90,icone:'fas fa-water',estoque:15,nota_media:4.4},
        {id:44,nome:'Terminal Direcao — Palio/Siena',codigo:'MD-005',categoria_id:5,categoria_nome:'Motor e Direcao',descricao_curta:'Terminal direcao Palio/Siena',preco:59.90,preco_promocional:49.90,icone:'fas fa-cog',estoque:20,nota_media:4.3},
        {id:50,nome:'Palheta Chuva Universal 18"',codigo:'AC-001',categoria_id:6,categoria_nome:'Palhetas e Acessorios',descricao_curta:'Palheta chuva universal 18"',preco:29.90,preco_promocional:24.90,icone:'fas fa-umbrella',estoque:40,nota_media:4.3},
        {id:51,nome:'Palheta Chuva Universal 20"',codigo:'AC-002',categoria_id:6,categoria_nome:'Palhetas e Acessorios',descricao_curta:'Palheta chuva universal 20"',preco:32.90,preco_promocional:null,icone:'fas fa-umbrella',estoque:35,nota_media:4.4},
        {id:52,nome:'Capa Volante Couro Universal',codigo:'AC-003',categoria_id:6,categoria_nome:'Palhetas e Acessorios',descricao_curta:'Capa volante couro sintetico',preco:49.90,preco_promocional:39.90,icone:'fas fa-steering-wheel',estoque:25,nota_media:4.5},
        {id:53,nome:'Perfume Automotivo Glicerio',codigo:'AC-004',categoria_id:6,categoria_nome:'Palhetas e Acessorios',descricao_curta:'Perfume Glicerio longa duracao',preco:19.90,preco_promocional:14.90,icone:'fas fa-spray-can',estoque:60,nota_media:4.7,destaque:1},
        {id:54,nome:'Tapete Borracha Universal 4 Peças',codigo:'AC-005',categoria_id:6,categoria_nome:'Palhetas e Acessorios',descricao_curta:'Kit 4 tapetes borracha universal',preco:79.90,preco_promocional:69.90,icone:'fas fa-car',estoque:30,nota_media:4.4},
        {id:60,nome:'Farol Dianteiro — Gol G5 (Par)',codigo:'IL-001',categoria_id:7,categoria_nome:'Iluminacao',descricao_curta:'Par farois dianteiros Gol G5',preco:399.90,preco_promocional:349.90,icone:'fas fa-lightbulb',estoque:5,nota_media:4.6,destaque:1},
        {id:61,nome:'Lanterna Traseira — Gol G5',codigo:'IL-002',categoria_id:7,categoria_nome:'Iluminacao',descricao_curta:'Lanterna traseira Gol G5',preco:179.90,preco_promocional:149.90,icone:'fas fa-lightbulb',estoque:8,nota_media:4.5},
        {id:62,nome:'Lampada H4 Super Branca (Par)',codigo:'IL-003',categoria_id:7,categoria_nome:'Iluminacao',descricao_curta:'Par lampadas H4 super branca 6000K',preco:89.90,preco_promocional:69.90,icone:'fas fa-lightbulb',estoque:30,nota_media:4.4,destaque:1},
        {id:63,nome:'Farol de Milha LED Universal',codigo:'IL-004',categoria_id:7,categoria_nome:'Iluminacao',descricao_curta:'Farol milha LED universal',preco:129.90,preco_promocional:99.90,icone:'fas fa-lightbulb',estoque:15,nota_media:4.6,destaque:1},
        {id:70,nome:'Corrente Comando — Hilux 3.0',codigo:'IM-001',categoria_id:8,categoria_nome:'Peças Importadas',descricao_curta:'Corrente comando importada Hilux',preco:589.90,preco_promocional:499.90,icone:'fas fa-globe',estoque:2,nota_media:4.8,destaque:1},
        {id:71,nome:'Sensor MAP — Civic 2012-2016',codigo:'IM-002',categoria_id:8,categoria_nome:'Peças Importadas',descricao_curta:'Sensor MAP original Civic importado',preco:349.90,preco_promocional:299.90,icone:'fas fa-globe',estoque:4,nota_media:4.7,destaque:1},
        {id:72,nome:'Bobina Ignição — Corolla 2014+',codigo:'IM-003',categoria_id:8,categoria_nome:'Peças Importadas',descricao_curta:'Bobina ignicao original Corolla',preco:279.90,preco_promocional:249.90,icone:'fas fa-globe',estoque:6,nota_media:4.5},
        {id:80,nome:'Kit Revisao Preventiva — Gol 1.0',codigo:'SV-001',categoria_id:9,categoria_nome:'Servicos',descricao_curta:'Kit completo revisao preventiva Gol',preco:299.90,preco_promocional:249.90,icone:'fas fa-tools',estoque:99,nota_media:4.8,destaque:1},
        {id:81,nome:'Troca de Oleo + Filtros — Todos Modelos',codigo:'SV-002',categoria_id:9,categoria_nome:'Servicos',descricao_curta:'Servico troca oleo + filtros',preco:89.90,preco_promocional:null,icone:'fas fa-tools',estoque:99,nota_media:4.7,destaque:1},
        {id:82,nome:'Alinhamento + Balanceamento 4 Rodas',codigo:'SV-003',categoria_id:9,categoria_nome:'Servicos',descricao_curta:'Alinhamento e balanceamento completo',preco:119.90,preco_promocional:99.90,icone:'fas fa-tools',estoque:99,nota_media:4.6},
        {id:83,nome:'Diagnostico Eletronico Scanner',codigo:'SV-004',categoria_id:9,categoria_nome:'Servicos',descricao_curta:'Diagnostico eletronico com scanner',preco:59.90,preco_promocional:null,icone:'fas fa-tools',estoque:99,nota_media:4.5}
    ];

    /* ============ CART ============ */
    var cart = JSON.parse(localStorage.getItem('chefao-cart') || '[]');
    function saveCart() { localStorage.setItem('chefao-cart', JSON.stringify(cart)); updateCartUI(); }
    function updateCartUI() {
        var cnt = cart.reduce(function(s,i){ return s+(i.qty||1); },0);
        var el = document.getElementById('cartCount');
        if (el) { el.textContent = cnt; el.style.display = cnt > 0 ? 'flex' : 'none'; }
    }
    function addToCart(p) {
        var ex = cart.find(function(i){ return i.id === p.id; });
        if (ex) ex.qty = (ex.qty||1)+1; else { p.qty = 1; cart.push(p); }
        saveCart(); showToast('Adicionado ao carrinho!');
    }
    function toggleCart() {
        var o = document.getElementById('cartOverlay'), d = document.getElementById('cartDrawer');
        var open = !d.classList.contains('open');
        if (open) { o.classList.add('open'); d.classList.add('open'); renderCartItems(); }
        else { o.classList.remove('open'); d.classList.remove('open'); }
    }
    function renderCartItems() {
        var el = document.getElementById('cartItems');
        if (!cart.length) { el.innerHTML = '<p style="text-align:center;color:#999;padding:30px;">Seu carrinho esta vazio</p>'; return; }
        var total = 0, html = '';
        cart.forEach(function(p,i){
            var pr = p.preco_promocional || p.preco;
            total += parseFloat(pr) * (p.qty||1);
            html += '<div style="display:flex;gap:10px;padding:10px 0;border-bottom:1px solid #eee;align-items:center;">'+
                '<div style="flex:1"><strong style="font-size:13px;">'+p.nome+'</strong><br><span style="color:#666;font-size:12px;">'+p.codigo+'</span></div>'+
                '<div style="text-align:right;"><strong>R$ '+(parseFloat(pr)*(p.qty||1)).toFixed(2)+'</strong><br><span style="font-size:11px;color:#999;">Qtd: '+(p.qty||1)+'</span></div>'+
                '<button onclick="removeCartItem('+i+')" style="background:none;border:none;color:#E74C3C;cursor:pointer;font-size:16px;">&times;</button></div>';
        });
        html += '<div style="text-align:right;padding:12px 0;font-size:16px;font-weight:700;">Total: R$ '+total.toFixed(2)+'</div>';
        html += '<button onclick="checkoutWhatsApp()" style="width:100%;padding:12px;background:#25D366;color:white;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;font-family:Inter,sans-serif;"><i class="fab fa-whatsapp"></i> Finalizar Pedido no WhatsApp</button>';
        el.innerHTML = html;
    }
    function removeCartItem(i) { cart.splice(i,1); saveCart(); renderCartItems(); }
    function checkoutWhatsApp() {
        var msg = 'Ola! Gostaria de fazer um pedido:%0A%0A';
        cart.forEach(function(p){ var pr = p.preco_promocional || p.preco; msg += '- '+p.nome+' (x'+p.qty+') - R$ '+(parseFloat(pr)*p.qty).toFixed(2)+'%0A'; });
        window.open('https://wa.me/5521994325697?text='+msg,'_blank');
    }
    document.getElementById('cartBtn').addEventListener('click', toggleCart);
    updateCartUI();
    window.addToCart = addToCart;
    window.removeCartItem = removeCartItem;
    window.checkoutWhatsApp = checkoutWhatsApp;

    /* ============ CATALOG ============ */
    var allProdutos = STATIC_PRODUCTS, filteredProdutos = [], currentPage = 1, perPage = 12;
    var navbarFilterCat = 0, navbarFilterPromo = false;

    var IMG_MAP = {33:'filtro_ar_real'};
    function pimg(id) { var n = IMG_MAP[id]; return n ? 'assets/'+n+'.png' : null; }

    window.filterByCat = function(id) {
        navbarFilterCat = id; navbarFilterPromo = false;
        document.querySelectorAll('.nav-item').forEach(function(el){ el.classList.remove('active'); });
        var navs = document.querySelectorAll('.nav-item'); if (id === 0 && navs[0]) navs[0].classList.add('active');
        applyFilters();
    };
    window.filterByPromo = function() {
        navbarFilterPromo = true; navbarFilterCat = 0;
        document.querySelectorAll('.nav-item').forEach(function(el){ el.classList.remove('active'); });
        var offer = document.querySelector('.nav-item.offer'); if (offer) offer.classList.add('active');
        applyFilters();
    };

    function loadCategorias() {
        var el = document.getElementById('filterCategories');
        if (!el) return;
        var html = '';
        STATIC_CATEGORIES.forEach(function(cat){
            html += '<label class="filter-check"><input type="checkbox" data-cat="'+cat.id+'" onchange="applyFilters()"><span>'+cat.nome+'</span><span class="filter-count">'+cat.total+'</span></label>';
        });
        el.innerHTML = html;
    }

    function applyFilters() {
        var catChecks = document.querySelectorAll('#filterCategories input:checked');
        var activeCats = Array.from(catChecks).map(function(cb){ return cb.dataset.cat; });
        var emEstoque = document.querySelector('#catalogSidebar input[data-filter="estoque"]');
        var soPromo = document.querySelector('#catalogSidebar input[data-filter="promocao"]');
        var precoMax = parseInt(document.getElementById('filterPrice').value);
        var sort = document.getElementById('sortSelect').value;
        var search = (document.getElementById('headerSearch').value || '').toLowerCase().trim();

        filteredProdutos = allProdutos.filter(function(p){
            if (navbarFilterCat > 0 && p.categoria_id !== navbarFilterCat) return false;
            if (navbarFilterPromo && !p.preco_promocional) return false;
            if (!navbarFilterCat && !navbarFilterPromo && activeCats.length > 0 && activeCats.indexOf(String(p.categoria_id)) === -1) return false;
            if (emEstoque && emEstoque.checked && (p.estoque||0) <= 0) return false;
            if (soPromo && soPromo.checked && !p.preco_promocional) return false;
            if (precoMax < 2000) { var pr = p.preco_promocional || p.preco; if (parseFloat(pr) > precoMax) return false; }
            if (search) { var str = (p.nome+' '+(p.codigo||'')+' '+(p.categoria_nome||'')).toLowerCase(); if (str.indexOf(search) === -1) return false; }
            return true;
        });

        if (sort === 'menor_preco') filteredProdutos.sort(function(a,b){ return parseFloat(a.preco_promocional||a.preco)-parseFloat(b.preco_promocional||b.preco); });
        else if (sort === 'maior_preco') filteredProdutos.sort(function(a,b){ return parseFloat(b.preco_promocional||b.preco)-parseFloat(a.preco_promocional||a.preco); });
        else filteredProdutos.sort(function(a,b){ return a.nome.localeCompare(b.nome,'pt-BR'); });

        currentPage = 1;
        var cnt = allProdutos.filter(function(p){ return !!p.preco_promocional; }).length;
        var el = document.getElementById('countPromo'); if (el) el.textContent = cnt;
        renderProducts();
    }

    function renderProducts() {
        var container = document.getElementById('produtosContainer');
        var results = document.getElementById('resultsCount');
        var total = filteredProdutos.length;
        if (results) results.innerHTML = '<strong>'+total+'</strong> produtos encontrados';

        if (total === 0) { container.innerHTML = '<div class="no-results"><i class="fas fa-search"></i><h3>Nenhum produto encontrado</h3><p>Tente ajustar os filtros ou buscar por outro termo.</p></div>'; renderPagination(0); return; }

        var totalPages = Math.ceil(total/perPage);
        if (currentPage > totalPages) currentPage = totalPages;
        var start = (currentPage-1)*perPage;
        var page = filteredProdutos.slice(start, start+perPage);

        var html = '';
        page.forEach(function(p){
            var preco = p.preco_promocional || p.preco;
            var temPromo = p.preco_promocional && p.preco_promocional < p.preco;
            var estoque = parseInt(p.estoque||0);
            var rating = Math.round((p.nota_media||4.5)*2)/2;
            var fullStars = Math.floor(rating), half = rating%1>=0.5;
            var parcelas = 6, parcelaVal = (parseFloat(preco)/parcelas).toFixed(2);

            var flags = '';
            if (estoque>0&&estoque<=3) flags += '<span class="product-flag flag-last">Ultimas</span>';
            if (temPromo) flags += '<span class="product-flag flag-offer">Oferta</span>';

            var stars = '';
            for (var s=0; s<5; s++) { if (s<fullStars) stars+='<i class="fas fa-star filled"></i>'; else if (s===fullStars&&half) stars+='<i class="fas fa-star-half-alt filled"></i>'; else stars+='<i class="fas fa-star"></i>'; }
            var votes = Math.floor(Math.random()*50)+3;

            html += '<div class="product-card">'+
                (flags?'<div class="product-flags">'+flags+'</div>':'')+
                '<button class="product-quick-cart" onclick="addToCart({id:'+p.id+',nome:\''+(p.nome).replace(/'/g,"\\'")+'\',codigo:\''+(p.codigo||'')+'\',preco:'+p.preco+',preco_promocional:'+(p.preco_promocional||'null')+'})"><i class="fas fa-cart-plus"></i></button>'+
                '<div class="product-image">'+(pimg(p.id)?'<img src="'+pimg(p.id)+'" alt="'+p.nome+'" style="width:100%;height:100%;object-fit:contain;padding:10px">':(p.imagem?'<img src="'+p.imagem+'" alt="'+p.nome+'">':'<i class="fas fa-car img-placeholder"></i>'))+'</div>'+
                '<div class="product-body">'+
                '<div class="product-code">Cod. '+(p.codigo||'---')+'</div>'+
                '<div class="product-name">'+p.nome+'</div>'+
                '<div class="product-rating"><div class="product-stars">'+stars+'</div><span class="product-votes">('+votes+')</span></div>'+
                '<div class="product-pricing">'+
                (temPromo?'<div class="product-price-from">R$ '+parseFloat(p.preco).toFixed(2)+'</div>':'<div class="product-price-from"></div>')+
                '<div class="product-price-to">R$ '+parseFloat(preco).toFixed(2)+'<small> no PIX</small></div>'+
                '<div class="product-installments">ou ate <b>'+parcelas+'x de R$ '+parcelaVal+'</b> s/ juros</div>'+
                '</div>'+
                '<div class="product-actions">'+
                '<button class="btn-buy" onclick="addToCart({id:'+p.id+',nome:\''+(p.nome).replace(/'/g,"\\'")+'\',codigo:\''+(p.codigo||'')+'\',preco:'+p.preco+',preco_promocional:'+(p.preco_promocional||'null')+'})">Comprar</button>'+
                '<a href="https://wa.me/5521994325697?text='+encodeURIComponent('Ola! Tenho interesse: '+p.nome+' (Cod: '+(p.codigo||'-')+') - R$ '+parseFloat(preco).toFixed(2))+'" target="_blank" class="btn-whats"><i class="fab fa-whatsapp"></i></a>'+
                '</div></div></div>';
        });
        container.innerHTML = html;
        renderPagination(totalPages);
    }

    function renderPagination(totalPages) {
        var el = document.getElementById('pagination');
        if (totalPages <= 1) { el.innerHTML = ''; return; }
        var html = '<button '+(currentPage<=1?'disabled':'')+' onclick="goToPage('+(currentPage-1)+')"><i class="fas fa-chevron-left"></i></button>';
        for (var i=1; i<=totalPages; i++) {
            if (i===1||i===totalPages||(i>=currentPage-2&&i<=currentPage+2))
                html += '<button class="'+(i===currentPage?'active':'')+'" onclick="goToPage('+i+')">'+i+'</button>';
            else if (i===currentPage-3||i===currentPage+3) html += '<button disabled>...</button>';
        }
        html += '<button '+(currentPage>=totalPages?'disabled':'')+' onclick="goToPage('+(currentPage+1)+')"><i class="fas fa-chevron-right"></i></button>';
        el.innerHTML = html;
    }
    function goToPage(page) { currentPage = page; renderProducts(); }

    /* ============ SIDEBAR ============ */
    function toggleSidebar() { document.getElementById('catalogSidebar').classList.toggle('open'); }
    function toggleFilter(btn) {
        btn.classList.toggle('active');
        var opts = btn.nextElementSibling;
        if (opts) opts.style.display = btn.classList.contains('active') ? 'block' : 'none';
    }
    function updatePriceLabel() {
        var v = parseInt(document.getElementById('filterPrice').value);
        document.getElementById('priceLabel').textContent = 'R$ '+v.toLocaleString('pt-BR');
        applyFilters();
    }
    function scrollToCatalog() { document.getElementById('catalogo').scrollIntoView({behavior:'smooth'}); }

    /* ============ VEHICLE FILTER ============ */
    var modelosMap = {chevrolet:['Onix','Prisma','Cruze','Cobalt','Spin','Tracker','S10','Montana'],volkswagen:['Gol','Voyage','Polo','Virtus','T-Cross','Nivus','Saveiro','Amarok'],fiat:['Uno','Palio','Argo','Cronos','Mobi','Strada','Toro','Pulse'],ford:['Ka','Fiesta','Focus','EcoSport','Ranger','Bronco'],renault:['Kwid','Sandero','Logan','Duster','Captur','Oroch'],honda:['Fit','City','Civic','HR-V','WR-V','CR-V'],toyota:['Etios','Yaris','Corolla','Hilux','SW4','RAV4'],hyundai:['HB20','Creta','Tucson','Santa Fe','i30']};
    var anosList = ['2024','2023','2022','2021','2020','2019','2018','2017','2016','2015'];
    function carregarModelos() {
        var marca = document.getElementById('filterMarca').value;
        var sel = document.getElementById('filterModelo');
        sel.innerHTML = '<option value="">Modelo...</option>';
        if (marca && modelosMap[marca]) modelosMap[marca].forEach(function(m){ sel.innerHTML += '<option value="'+m+'">'+m+'</option>'; });
        var selAno = document.getElementById('filterAno'); selAno.innerHTML = '<option value="">Ano...</option>';
        anosList.forEach(function(a){ selAno.innerHTML += '<option value="'+a+'">'+a+'</option>'; });
    }
    function filterByVehicle() {
        var termos = [document.getElementById('filterMarca').value, document.getElementById('filterModelo').value, document.getElementById('filterAno').value].filter(Boolean).join(' ');
        if (termos) document.getElementById('headerSearch').value = termos;
        applyFilters();
    }

    /* ============ TOAST ============ */
    function showToast(msg) {
        var el = document.getElementById('toast'); if (!el) { el = document.createElement('div'); el.id = 'toast'; el.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#333;color:white;padding:12px 20px;border-radius:8px;font-size:14px;z-index:9999;transition:all 0.3s;opacity:0;transform:translateX(20px);'; document.body.appendChild(el); }
        el.textContent = msg; el.style.opacity = '1'; el.style.transform = 'translateX(0)';
        setTimeout(function(){ el.style.opacity = '0'; el.style.transform = 'translateX(20px)'; }, 3000);
    }

    /* ============ SEARCH DEBOUNCE ============ */
    var searchTimer;
    document.getElementById('headerSearch').addEventListener('input', function(){ clearTimeout(searchTimer); searchTimer = setTimeout(function(){ currentPage = 1; applyFilters(); }, 400); });
    document.getElementById('headerSearch').addEventListener('keydown', function(e){ if (e.key==='Enter'){ e.preventDefault(); applyFilters(); } });

    /* ============ INIT ============ */
    loadCategorias();
    applyFilters();
    updateCartUI();

    /* ============ CART STYLES ============ */
    var cartStyles = document.createElement('style'); cartStyles.textContent = '.cart-overlay{display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.4);z-index:3000;}.cart-overlay.open{display:block;}.cart-drawer{position:fixed;top:0;right:0;width:380px;max-width:90vw;height:100vh;background:white;z-index:3001;box-shadow:-4px 0 20px rgba(0,0,0,0.15);transform:translateX(100%);transition:transform 0.3s;display:flex;flex-direction:column;}.cart-drawer.open{transform:translateX(0);}.cart-drawer-header{display:flex;justify-content:space-between;align-items:center;padding:16px;border-bottom:1px solid #eee;}.cart-drawer-header button{background:none;border:none;font-size:24px;cursor:pointer;color:#999;}.cart-drawer-items{flex:1;overflow-y:auto;padding:16px;}'; document.head.appendChild(cartStyles);
});
