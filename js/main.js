document.addEventListener('DOMContentLoaded', function() { 'use strict';

    /* ============ STATIC DATA ============ */
    var STATIC_CATEGORIES = [
        {id:1,nome:'Baterias',slug:'baterias',total:14},{id:2,nome:'Suspensao',slug:'suspensao',total:14},
        {id:3,nome:'Freios',slug:'freios',total:14},{id:4,nome:'Oleos e Filtros',slug:'oleos-e-filtros',total:16},
        {id:5,nome:'Motor e Direcao',slug:'motor-e-direcao',total:14},{id:6,nome:'Palhetas e Acessorios',slug:'palhetas-acessorios',total:14},
        {id:7,nome:'Iluminacao',slug:'iluminacao',total:14},{id:8,nome:'PeÃ§as Importadas',slug:'pecas-importadas',total:14},
        {id:9,nome:'Servicos',slug:'servicos',total:14},{id:10,nome:'Arrefecimento',slug:'arrefecimento',total:11},
        {id:11,nome:'Embreagem',slug:'embreagem',total:11},{id:12,nome:'IgniÃ§Ã£o e Injecao',slug:'ignicao-injecao',total:11},
        {id:13,nome:'Ar Condicionado',slug:'ar-condicionado',total:6},{id:14,nome:'Escapamento',slug:'escapamento',total:8}
    ];
    var allProdutos = [], filteredProdutos = [], currentPage = 1, perPage = 12;

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
    window.addToCart = addToCart;
    function toggleCart() {
        var o = document.getElementById('cartOverlay'), d = document.getElementById('cartDrawer');
        var open = !d.classList.contains('open');
        if (open) { o.classList.add('open'); d.classList.add('open'); renderCartItems(); }
        else { o.classList.remove('open'); d.classList.remove('open'); }
    }
    window.toggleCart = toggleCart;
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
    var allProdutos = [], filteredProdutos = [], currentPage = 1, perPage = 12;
    var navbarFilterCat = 0, navbarFilterPromo = false;

    fetch('products.json?_='+Date.now()).then(function(r){return r.json();}).then(function(d){ allProdutos = d; applyFilters(); }).catch(function(){ allProdutos = []; applyFilters(); });

        var IMG_MAP = {
        1:'prod_001_bateria_automotiva_60ah_gol_fox',
        2:'prod_002_bateria_automotiva_45ah_uno_mobi',
        3:'prod_003_bateria_automotiva_70ah_corolla_civ',
        4:'prod_004_bateria_automotiva_100ah_hilux_s10',
        5:'prod_005_bateria_heliar_50ah_strada',
        6:'prod_006_bateria_moura_75ah_cruze',
        7:'prod_007_bateria_bosch_60ah_sandero',
        8:'prod_008_bateria_acdelco_48ah_celta_corsa',
        9:'prod_009_bateria_90ah_l200_ranger_frontier',
        10:'prod_010_amortecedor_dianteiro_gol_g5',
        11:'prod_011_amortecedor_traseiro_gol_par',
        12:'prod_012_amortecedor_cofap_onix_prisma_fotog',
        13:'prod_013_bandeja_suspensao_dianteira_gol_g5',
        14:'prod_014_bieleta_estabilizadora_fox_polo',
        15:'prod_015_kit_4_amortecedores_corolla_2014',
        16:'prod_016_pivo_suspens_o_dianteiro_palio',
        17:'prod_017_coxim_amortecedor_dianteiro_hb20',
        18:'prod_018_barra_estabilizadora_dianteira_onix',
        19:'prod_019_kit_suspens_o_completa_fox',
        20:'prod_020_pastilha_freio_uno_way',
        21:'prod_021_pastilha_freio_gol_g5',
        22:'prod_022_disco_freio_ventilado_gol_fox',
        23:'prod_023_disco_freio_onix_2012',
        24:'prod_024_pastilha_freio_traseira_hb20',
        25:'prod_025_kit_completo_freio_dianteiro_gol',
        26:'prod_026_lona_freio_traseira_fiorino',
        27:'prod_027_cilindro_freio_traseiro_uno',
        28:'prod_028_fluido_freio_dot4_500ml',
        29:'prod_029_disco_freio_traseiro_corolla_2014',
        30:'prod_030_oleo_motor_5w30_sintetico_1_litro',
        31:'prod_031_oleo_motor_20w50_mineral_1_litro',
        32:'prod_032_filtro_oleo_motor_automotivo_gol_un',
        33:'filtro_ar_real',
        34:'prod_034_filtro_combustivel_fiat_palio_autom',
        35:'prod_035_oleo_castrol_10w40_semi_sintetico_1',
        36:'prod_036_filtro_oleo_corolla_civic_automotiv',
        37:'filtro_ar_real',
        38:'prod_038_oleo_15w40_diesel_petronas_1_litro',
        39:'prod_039_aditivo_radiador_paraflu',
        40:'prod_040_homocinetica_completa_gol_fox',
        41:'prod_041_caixa_direcao_mecanica_gol_g5',
        42:'prod_042_correia_dentada_tensor_onix_1_0',
        43:'prod_043_bomba_agua_gol_fox_1_0',
        44:'prod_044_terminal_direcao_palio_siena',
        45:'prod_045_correia_alternador_gol_g5',
        46:'prod_046_trizeta_homocinetica_s10_blazer',
        47:'prod_047_jogo_velas_igni_o_ngk_iridium_hb20',
        48:'prod_048_tampa_valvula_motor_gol_ea111',
        49:'prod_049_junta_cabe_ote_fiat_fire',
        50:'prod_050_palheta_chuva_universal_18_polegada',
        51:'prod_051_palheta_chuva_universal_20_polegada',
        52:'prod_052_capa_volante_couro_universal_automo',
        53:'prod_053_perfume_automotivo_glicerino',
        54:'prod_054_tapete_borracha_universal',
        55:'prod_055_palheta_chuva_valeo_silencio_16',
        56:'prod_056_suporte_celular_ventosa_universal',
        57:'prod_057_kit_emerg_ncia_tri_ngulo_sinaliza',
        58:'prod_058_retrovisor_interno_panor_mico_300mm',
        59:'prod_059_organizador_porta_malas',
        60:'prod_060_farol_dianteiro_gol_g5',
        61:'prod_061_lanterna_traseira_gol_g5',
        62:'prod_062_lampada_h4_super_branca_6000k',
        63:'prod_063_farol_milha_led_universal_automotiv',
        64:'prod_064_lampada_h7_philips_xtreme',
        65:'prod_065_lanterna_traseira_onix_2016',
        66:'prod_066_kit_xenon_h4_55w_6000k',
        67:'prod_067_lampada_led_h1_100w_automotiva',
        68:'prod_068_lanterna_teto_led_48smd_carga',
        69:'prod_069_pisca_retrovisor_hb20',
        70:'prod_070_corrente_comando_hilux_3_0_diesel',
        71:'prod_071_sensor_map_civic_2012',
        72:'prod_072_bobina_ignicao_corolla_2014',
        73:'prod_073_rolamento_roda_dianteira_cruze',
        74:'prod_074_sensor_abs_ranger_2012',
        75:'prod_075_bomba_combust_vel_el_trica_l200',
        76:'prod_076_sonda_lambda_sensor_oxigenio_hb20',
        77:'prod_077_bico_injetor_diesel_sprinter',
        78:'prod_078_v_lvula_egr_corolla',
        79:'prod_079_corpo_borboleta_ducato_2_3',
        80:'prod_080_kit_revisao_preventiva_automotiva',
        81:'prod_081_troca_oleo_filtros_servico_automoti',
        82:'prod_082_alinhamento_balanceamento_4_rodas',
        83:'prod_083_diagnostico_eletronico_scanner_auto',
        84:'prod_084_troca_correia_dentada',
        85:'prod_085_recarga_ar_condicionado',
        86:'prod_086_troca_pastilha_disco_freio_servi_o',
        87:'prod_087_troca_embreagem_servi_o',
        88:'prod_088_limpeza_bico_injetor_ultrass_nica',
        89:'prod_089_geometria_cambagem_automotiva',
        90:'prod_090_radiador_motor_gol_g5',
        91:'prod_091_radiador_onix',
        92:'prod_092_ventoinha_radiador_palio',
        93:'prod_093_reservat_rio_gua_radiador_gol',
        94:'prod_094_bomba_agua_palio_fire_1_4',
        95:'prod_095_mangueira_radiador_superior_gol',
        96:'prod_096_v_lvula_termost_tica_onix',
        97:'prod_097_tampa_reservat_rio_expans_o_gol',
        98:'prod_098_radiador_ar_quente_caminh_o',
        99:'prod_099_eletroventilador_12v_universal',
        100:'prod_100_intercooler_hilux_3_0_d4d',
        101:'prod_101_kit_embreagem_completo_gol_g5',
        102:'prod_102_kit_embreagem_palio_fire',
        103:'prod_103_disco_embreagem_s10_diesel',
        104:'prod_104_plato_embreagem_hb20',
        105:'prod_105_atuador_embreagem_hidraulico_fox',
        106:'prod_106_cabo_embreagem_celta',
        107:'prod_107_kit_embreagem_refor_ado_ranger',
        108:'prod_108_cilindro_mestre_embreagem_gol',
        109:'prod_109_cilindro_auxiliar_embreagem_s10',
        110:'prod_110_garfo_embreagem_strada',
        111:'prod_111_rolamento_embreagem_uno',
        112:'prod_112_vela_igni_o_ngk_gol',
        113:'prod_113_cabo_vela_palio_fire',
        114:'prod_114_bobina_igni_o_onix_1_0_2012',
        115:'prod_115_sensor_rotacao_hb20_1_0_automot',
        116:'prod_116_sensor_temperatura_gol_g5_autom',
        117:'prod_117_bomba_combust_vel_el_trica_uno',
        118:'prod_118_alternador_70a_gol_g5',
        119:'prod_119_motor_partida_palio_fire',
        120:'prod_120_sensor_fase_comando_fox_1_6_aut',
        121:'prod_121_corpo_borboleta_eletr_nico_hb20',
        122:'prod_122_bico_injetor_gasolina_palio',
        123:'prod_123_compressor_ar_condicionado_gol_g5',
        124:'prod_124_condensador_ar_condicionado_onix',
        125:'prod_125_evaporador_ar_condicionado_palio',
        126:'prod_126_filtro_cabine_gol_fox',
        127:'prod_127_ventilador_ar_condicionado_palio',
        128:'prod_128_pressostato_ar_condicionado_univers',
        129:'prod_129_abafador_intermedi_rio_palio',
        130:'prod_130_abafador_traseiro_gol_g5',
        131:'prod_131_catalisador_corsa_1_0',
        132:'prod_132_coletor_escape_onix_1_4',
        133:'prod_133_ponteira_cromada_escapamento_63mm',
        134:'prod_134_silencioso_dianteiro_fiorino',
        135:'prod_135_flex_vel_escapamento_palio',
        136:'prod_136_sensor_oxigenio_uno_1_0_automot'
    };
    function pimg(id) { var n = IMG_MAP[id]; return n ? 'assets/'+n+'.png' : null; }
    function escAttr(s) { return s.replace(/'/g,"\\'").replace(/"/g,"&quot;"); }

    window.filterByCat = function(id, el) {
        navbarFilterCat = id; navbarFilterPromo = false;
        document.querySelectorAll('.nav-item').forEach(function(e){ e.classList.remove('active'); });
        if (el) el.classList.add('active');
        applyFilters();
    };
    window.filterByPromo = function(el) {
        navbarFilterPromo = true; navbarFilterCat = 0;
        document.querySelectorAll('.nav-item').forEach(function(e){ e.classList.remove('active'); });
        if (el) el.classList.add('active');
        applyFilters();
    };
    window.resetFilters = function() {
        navbarFilterCat = 0; navbarFilterPromo = false;
        document.querySelectorAll('.nav-item').forEach(function(e){ e.classList.remove('active'); });
        var firstNav = document.querySelector('.nav-item'); if (firstNav) firstNav.classList.add('active');
        document.getElementById('headerSearch').value = '';
        document.getElementById('filterPrice').value = 2000;
        document.getElementById('priceLabel').textContent = 'R$ 2.000';
        document.getElementById('sortSelect').value = 'nome';
        document.getElementById('filterMarca').value = '';
        document.getElementById('filterModelo').innerHTML = '<option value="">Modelo...</option>';
        document.getElementById('filterAno').innerHTML = '<option value="">Ano...</option>';
        var catCBs = document.querySelectorAll('#filterCategories input'); catCBs.forEach(function(cb){ cb.checked = false; });
        var emEst = document.querySelector('#catalogSidebar input[data-filter="estoque"]'); if (emEst) emEst.checked = true;
        var soPro = document.querySelector('#catalogSidebar input[data-filter="promocao"]'); if (soPro) soPro.checked = false;
        currentPage = 1;
        applyFilters();
    };
    window.applyFilters = applyFilters;
    window.updatePriceLabel = updatePriceLabel;
    window.carregarModelos = carregarModelos;
    window.filterByVehicle = filterByVehicle;
    window.toggleFilter = toggleFilter;
    window.toggleSidebar = toggleSidebar;
    window.goToPage = goToPage;

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
        var activeCats = [].slice.call(catChecks).map(function(cb){ return cb.dataset.cat; });
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
                '<button class="product-quick-cart" onclick="addToCart({id:'+p.id+',nome:\''+escAttr(p.nome)+'\',codigo:\''+(p.codigo||'')+'\',preco:'+p.preco+',preco_promocional:'+(p.preco_promocional||'null')+'})"><i class="fas fa-cart-plus"></i></button>'+
                '<div class="product-image">'+(pimg(p.id)?'<img src="'+pimg(p.id)+'" alt="'+escAttr(p.nome)+'" style="width:100%;height:100%;object-fit:contain;padding:10px">':(p.imagem?'<img src="'+p.imagem+'" alt="'+escAttr(p.nome)+'">':'<i class="fas fa-car img-placeholder"></i>'))+'</div>'+
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
                '<button class="btn-buy" onclick="addToCart({id:'+p.id+',nome:\''+escAttr(p.nome)+'\',codigo:\''+(p.codigo||'')+'\',preco:'+p.preco+',preco_promocional:'+(p.preco_promocional||'null')+'})">Comprar</button>'+
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
    var modelosMap = {chevrolet:['Onix','Prisma','Cruze','Cobalt','Spin','Tracker','S10','Montana','Celta','Corsa','Classic','Vectra','Astra','Zafira','Blazer','Captiva','Trailblazer','Equinox','Camaro'],volkswagen:['Gol','Voyage','Polo','Virtus','T-Cross','Nivus','Saveiro','Amarok','Fox','CrossFox','Up','Jetta','Passat','Tiguan','Taos','Golf','Kombi','Fusca','Parati'],fiat:['Uno','Palio','Argo','Cronos','Mobi','Strada','Toro','Pulse','Siena','Grand Siena','Punto','Linea','Bravo','Idea','Doblo','Fiorino','Ducato','Freemont'],ford:['Ka','Fiesta','Focus','EcoSport','Ranger','Bronco','Fusion','Edge','Territory','Mustang','Transit','Maverick','New Fiesta','Courier','Puma'],renault:['Kwid','Sandero','Logan','Duster','Captur','Oroch','Stepway','Fluence','Master','Kangoo','Megane','Clio','Scenic','Symbol','Taliant'],honda:['Fit','City','Civic','HR-V','WR-V','CR-V','Accord','Touring','Pilot','Jazz'],toyota:['Etios','Yaris','Corolla','Hilux','SW4','RAV4','Camry','Prius','Corolla Cross','Land Cruiser','Tacoma','Supra'],hyundai:['HB20','Creta','Tucson','Santa Fe','i30','Azera','Elantra','Veloster','ix35','Kona','HR','Genesis'],jeep:['Renegade','Compass','Commander','Wrangler','Cherokee','Grand Cherokee','Gladiator'],nissan:['March','Versa','Kicks','Sentra','Frontier','Leaf','X-Trail','Patrol','Tiida','Livina'],mitsubishi:['Lancer','ASX','Pajero','Eclipse Cross','L200 Triton','Outlander','Pajero Sport','Eclipse'],peugeot:['208','2008','3008','Expert','Boxer','Hoggar','307','308','408','Partner','RCZ'],citroen:['C3','C4 Cactus','Aircross','Jumper','Jumpy','Xsara Picasso','Grand C4 Picasso','DS3','DS4','DS5'],chery:['Tiggo 2','Tiggo 5','Tiggo 7','Tiggo 8','Arrizo 5','Arrizo 6','Celer','QQ','iCar'],bmw:['320i','X1','X3','X5','X6','118i','120i','M3','M5','330e','430i','540i'],mercedes:['C180','GLA','A200','Sprinter','C200','GLC','E250','ML350','CLA200','GLB200','Vito'],audi:['A3','A4','Q3','Q5','A1','A5','TT','Q7','Q8','e-tron','RS3','SQ5']};
    var anosList = ['2025','2024','2023','2022','2021','2020','2019','2018','2017','2016','2015','2014','2013','2012','2011','2010','2009','2008'];
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
    initLogin();

    /* ============ LOGIN / CADASTRO (hover dropdown estilo AZ) ============ */
    var currentUser = JSON.parse(localStorage.getItem('chefao-v3-user') || 'null');
    var closeTimer = null, contactTimer = null;
    function initLogin() { if (currentUser) document.getElementById('loginLabel').textContent = currentUser.nome.split(' ')[0]; }
    window.openLoginDropdown = function() {
        clearTimeout(closeTimer);
        var dd = document.getElementById('loginDropdown'); dd.style.display = 'block';
        var h = '';
        if (currentUser) {
            h = '<div style="padding:4px 0;font-size:12px;color:#666;border-bottom:1px solid #eee;margin-bottom:6px">Ola, <b>'+currentUser.nome.split(' ')[0]+'</b></div>'+
                '<div class="lg-menu-item" onclick="showOrders()"><i class="fas fa-box"></i> Meus Pedidos</div>'+
                '<div class="lg-menu-item" onclick="showProfile()"><i class="fas fa-user-edit"></i> Meus Dados</div>'+
                '<div class="lg-menu-item danger" style="border:none" onclick="doLogout()"><i class="fas fa-sign-out-alt"></i> Sair</div>';
        } else {
            h = '<button class="lg-btn" onclick="showLoginForm()"><i class="fas fa-sign-in-alt"></i> Entrar</button>'+
                '<div class="lg-sep">ou</div>'+
                '<div class="lg-link" onclick="showRegisterForm()">Cliente novo? <b>Cadastre-se</b></div>'+
                '<div style="border-top:1px solid #eee;margin-top:8px;padding-top:8px">'+
                '<div class="lg-menu-item" style="border:none" onclick="showOrders()"><i class="fas fa-box"></i> Meus Pedidos</div></div>';
        }
        dd.innerHTML = h;
    };
    window.scheduleCloseDropdown = function() { closeTimer = setTimeout(function(){ document.getElementById('loginDropdown').style.display = 'none'; }, 300); };
    window.cancelCloseDropdown = function() { clearTimeout(closeTimer); };
    window.showLoginForm = function() {
        var dd = document.getElementById('loginDropdown');
        dd.innerHTML = '<h4>Entrar</h4><input id="lgEmail2" class="lg-input" type="email" placeholder="Email"><input id="lgSenha2" class="lg-input" type="password" placeholder="Senha"><button class="lg-btn" onclick="doLogin2()"><i class="fas fa-sign-in-alt"></i> Entrar</button><div class="lg-link" onclick="openLoginDropdown()"><i class="fas fa-arrow-left"></i> Voltar</div>';
        dd.style.display = 'block';
    };
    window.showRegisterForm = function() {
        var dd = document.getElementById('loginDropdown');
        dd.innerHTML = '<h4>Cadastre-se</h4><input id="rgNome" class="lg-input" placeholder="Nome completo"><input id="rgEmail" class="lg-input" type="email" placeholder="Email"><input id="rgSenha" class="lg-input" type="password" placeholder="Senha (min. 4 digitos)"><button class="lg-btn" onclick="doRegister()"><i class="fas fa-user-plus"></i> Criar Conta</button><div class="lg-link" onclick="openLoginDropdown()"><i class="fas fa-arrow-left"></i> Voltar</div>';
        dd.style.display = 'block';
    };
    window.doLogin2 = function() {
        var e = document.getElementById('lgEmail2').value.trim(), s = document.getElementById('lgSenha2').value.trim();
        if (!e || s.length < 4) { showToast('Preencha email e senha'); return; }
        currentUser = { nome: e.split('@')[0], email: e, cadastro: new Date().toISOString() };
        localStorage.setItem('chefao-v3-user', JSON.stringify(currentUser));
        document.getElementById('loginLabel').textContent = e.split('@')[0];
        document.getElementById('loginDropdown').style.display = 'none';
        showToast('Bem-vindo!');
    };
    window.doRegister = function() {
        var n = document.getElementById('rgNome').value.trim(), e = document.getElementById('rgEmail').value.trim(), s = document.getElementById('rgSenha').value.trim();
        if (!n || !e || s.length < 4) { showToast('Preencha todos os campos'); return; }
        currentUser = { nome: n, email: e, cadastro: new Date().toISOString() };
        localStorage.setItem('chefao-v3-user', JSON.stringify(currentUser));
        document.getElementById('loginLabel').textContent = n.split(' ')[0];
        document.getElementById('loginDropdown').style.display = 'none';
        showToast('Conta criada!');
    };
    window.doLogout = function() {
        currentUser = null; localStorage.removeItem('chefao-v3-user');
        document.getElementById('loginLabel').textContent = 'Entrar';
        document.getElementById('loginDropdown').style.display = 'none';
    };
    window.showOrders = function() {
        document.getElementById('loginDropdown').style.display = 'none';
        var ov = document.createElement('div'); ov.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:5000;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center';
        ov.onclick = function(e) { if (e.target === ov) ov.remove(); };
        var orders = JSON.parse(localStorage.getItem('chefao-v3-orders') || '[]');
        var oh = orders.length ? orders.map(function(o){ return '<div style="background:#f9f9f9;padding:12px;border-radius:8px;margin-bottom:8px"><strong>#'+o.id+'</strong> - '+o.date+'<br><span style="font-size:11px;color:#666">'+o.items.map(function(i){return i.nome+' x'+i.qty}).join(', ')+'</span><br><strong>R$ '+o.total.toFixed(2)+'</strong></div>'; }).join('') : '<p style="color:#999;text-align:center;padding:20px">Nenhum pedido ainda</p>';
        ov.innerHTML = '<div style="background:#fff;border-radius:12px;padding:24px;width:90vw;max-width:500px;max-height:80vh;overflow-y:auto" onclick="event.stopPropagation()"><h3 style="margin-bottom:14px"><i class="fas fa-box"></i> Meus Pedidos</h3>'+oh+'<button class="lg-btn" onclick="this.closest(\'div[style*=z-index]\').remove()">Fechar</button></div>';
        document.body.appendChild(ov);
    };
    window.showProfile = function() {
        if (!currentUser) return;
        alert('Nome: '+currentUser.nome+'\nEmail: '+currentUser.email+'\nCadastro: '+new Date(currentUser.cadastro).toLocaleDateString('pt-BR'));
    };

    /* === CONTACT DROPDOWN === */
    window.openContactDropdown = function() {
        clearTimeout(contactTimer);
        document.getElementById('contactDropdown').style.display = 'block';
    };
    window.scheduleCloseContact = function() { contactTimer = setTimeout(function(){ document.getElementById('contactDropdown').style.display = 'none'; }, 300); };
    window.cancelCloseContact = function() { clearTimeout(contactTimer); };

    /* ============ CART STYLES ============ */
    var cartStyles = document.createElement('style'); cartStyles.textContent = '.cart-overlay{display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.4);z-index:3000;}.cart-overlay.open{display:block;}.cart-drawer{position:fixed;top:0;right:0;width:380px;max-width:90vw;height:100vh;background:white;z-index:3001;box-shadow:-4px 0 20px rgba(0,0,0,0.15);transform:translateX(100%);transition:transform 0.3s;display:flex;flex-direction:column;}.cart-drawer.open{transform:translateX(0);}.cart-drawer-header{display:flex;justify-content:space-between;align-items:center;padding:16px;border-bottom:1px solid #eee;}.cart-drawer-header button{background:none;border:none;font-size:24px;cursor:pointer;color:#999;}.cart-drawer-items{flex:1;overflow-y:auto;padding:16px;}'; document.head.appendChild(cartStyles);
});
