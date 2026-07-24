"""
get_images_v2.py — Refined image search for Chefão Autopecas
Strategy:
1. Only map existing assets where product name matches image type EXACTLY
2. For all other products, search DuckDuckGo with VERY specific Portuguese queries
3. Convert ALL images to PNG for compatibility with pimg()
4. Validate image quality (min dimensions, valid file)
"""
import os, re, json, time
from io import BytesIO
from PIL import Image
import requests
from ddgs import DDGS

PROJECT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(PROJECT, 'assets')
MAIN_JS = os.path.join(PROJECT, 'js', 'main.js')
os.makedirs(ASSETS, exist_ok=True)

# ── Full product list ──
PRODUCTS = [
    (1,"Bateria 60Ah Cral — Gol/Fox/Polo",1),(2,"Bateria 45Ah — Uno/Mobi/Onix",1),
    (3,"Bateria 70Ah Zetta — Corolla/Civic",1),(4,"Bateria 100Ah — Hilux/S10",1),
    (5,"Bateria Heliar 50Ah — Strada/Saveiro",1),(6,"Bateria Moura 75Ah — Cruze/Focus",1),
    (7,"Bateria Bosch 60Ah — Sandero/Logan",1),(8,"Bateria ACDelco 48Ah — Celta/Corsa",1),
    (9,"Bateria 90Ah — L200/Ranger/Frontier",1),
    (10,"Amortecedor Dianteiro — Gol G5/G6",2),(11,"Kit Amortecedor Traseiro — Gol",2),
    (12,"Amortecedor Diant. Cofap — Onix/Prisma",2),(13,"Bandeja Dianteira — Gol G5",2),
    (14,"Bieleta Dianteira — Fox/Polo",2),(15,"Kit 4 Amortecedores — Corolla 2014-2018",2),
    (16,"Pivo Suspensao Dianteiro — Palio/Siena",2),(17,"Coxim Amortecedor Dianteiro — HB20",2),
    (18,"Barra Estabilizadora Diant. — Onix",2),(19,"Kit Suspensao Completo — Fox 2010-2016",2),
    (20,"Pastilha de Freio — Uno Way 1.4",3),(21,"Pastilha de Freio — Gol G5/G6",3),
    (22,"Disco de Freio Ventilado — Gol/Fox",3),(23,"Disco de Freio — Onix 2012-2019",3),
    (24,"Pastilha Traseira — HB20 2013-2020",3),(25,"Kit Completo Freio Dianteiro — Gol",3),
    (26,"Lona de Freio Traseira — Fiorino",3),(27,"Cilindro de Freio Traseiro — Uno",3),
    (28,"Fluido de Freio DOT4 500ml",3),(29,"Disco Freio Traseiro — Corolla 2014-2018",3),
    (30,"Oleo Motor 5W30 Sintetico 1L",4),(31,"Oleo Motor 20W50 Mineral 1L",4),
    (32,"Filtro de Oleo — Gol/Uno/Onix",4),(33,"Filtro de Ar — Gol G5/Fox",4),
    (34,"Filtro de Combustivel — Fiat Palio",4),(35,"Oleo 10W40 Semi-Sintetico Castrol 1L",4),
    (36,"Filtro de Oleo — Corolla/Civic",4),(37,"Filtro de Ar — Ducato/Boxer 2.3",4),
    (38,"Oleo 15W40 Diesel Petronas 1L",4),(39,"Aditivo Radiador 1L — Paraflu",4),
    (40,"Homocinetica Completa — Gol/Fox",5),(41,"Caixa de Direcao — Gol G5/G6",5),
    (42,"Correia Dentada + Tensor — Onix 1.0",5),(43,"Bomba d'Agua — Gol/Fox 1.0",5),
    (44,"Terminal Direcao — Palio/Siena",5),(45,"Correia Alternador — Gol G5",5),
    (46,"Trizeta Homocinetica — S10/Blazer",5),(47,"Jogo de Velas NGK Iridium — HB20 1.0",5),
    (48,"Tampa Valvula — Gol G5 EA111",5),(49,"Junta Cabecote — Fiat Fire 1.0",5),
    (50,'Palheta Chuva Universal 18"',6),(51,'Palheta Chuva Universal 20"',6),
    (52,"Capa Volante Couro Universal",6),(53,"Perfume Automotivo Glicerio",6),
    (54,"Tapete Borracha Universal 4 Pecas",6),(55,'Palheta Chuva 16" Valeo Silencio',6),
    (56,"Suporte Celular Ventosa Universal",6),(57,"Kit Emergencia — Triangulo + Cabo + Chave",6),
    (58,"Retrovisor Interno Panoramico 300mm",6),(59,"Organizador Porta-Malas Dobravel",6),
    (60,"Farol Dianteiro — Gol G5 (Par)",7),(61,"Lanterna Traseira — Gol G5",7),
    (62,"Lampada H4 Super Branca (Par)",7),(63,"Farol de Milha LED Universal",7),
    (64,"Lampada H7 Philips X-treme 130%",7),(65,"Lanterna Traseira — Onix 2016-2019 (LD)",7),
    (66,"Kit Xenon H4 55W 6000K",7),(67,"Lampada LED H1 100W 12000LM (Par)",7),
    (68,"Lanterna de Teto LED 48SMD — Carga",7),(69,"Pisca Retrovisor — HB20 2016-2020",7),
    (70,"Corrente Comando — Hilux 3.0",8),(71,"Sensor MAP — Civic 2012-2016",8),
    (72,"Bobina Ignição — Corolla 2014+",8),(73,"Rolamento Roda Diant. — Cruze 2012+",8),
    (74,"Sensor ABS — Ford Ranger 2012+",8),(75,"Eletrobomba Combustivel — L200 Triton",8),
    (76,"Sensor Oxigenio Lambda — HB20 1.6",8),(77,"Bico Injetor Diesel — Sprinter 2.2",8),
    (78,"Valvula EGR — Corolla 2015+",8),(79,"Corpo de Borboleta — Ducato 2.3",8),
    (80,"Kit Revisao Preventiva — Gol 1.0",9),(81,"Troca de Oleo + Filtros — Todos Modelos",9),
    (82,"Alinhamento + Balanceamento 4 Rodas",9),(83,"Diagnostico Eletronico Scanner",9),
    (84,"Troca Correia Dentada — Gol 1.0",9),(85,"Recarga Ar-Condicionado R134a",9),
    (86,"Troca Pastilhas + Discos Diant.",9),(87,"Troca de Embreagem — Palio 1.0",9),
    (88,"Limpeza Bico Injetor Ultrassonica",9),(89,"Geometria e Cambagem — Completa",9),
    (90,"Radiador Motor — Gol G5 1.0",10),(91,"Radiador — Onix 1.4 2012-2019",10),
    (92,"Ventoinha Motor — Palio Fire",10),(93,"Reservatorio Agua — Gol G5",10),
    (94,"Bomba d'Agua — Palio 1.4 Fire",10),(95,"Mangueira Radiador Superior — Gol G5",10),
    (96,"Valvula Termostatica — Onix 1.0",10),(97,"Tampa Reservatorio — Gol/Fox",10),
    (98,"Radiador Ar Quente — Caminhao Mercedes",10),(99,'Eletroventilador 12V 14" Universal',10),
    (100,"Intercooler — Hilux 3.0 D-4D",10),
    (101,"Kit Embreagem Completo — Gol G5",11),(102,"Kit Embreagem — Palio 1.0 Fire",11),
    (103,"Disco Embreagem — S10 2.8 Diesel",11),(104,"Plato Embreagem — HB20 1.0",11),
    (105,"Atuador Embreagem — Fox 1.6",11),(106,"Cabo Embreagem — Celta 1.0",11),
    (107,"Kit Embreagem — Ranger 2.8 Diesel",11),(108,"Cilindro Mestre Embreagem — Gol",11),
    (109,"Cilindro Auxiliar Embreagem — S10",11),(110,"Garfo Embreagem — Strada 1.4",11),
    (111,"Rolamento Embreagem — Uno 1.0",11),
    (112,"Vela Ignição NGK — Gol 1.0 G5",12),(113,"Cabo de Vela — Fiat Palio Fire",12),
    (114,"Bobina Ignição — Onix 1.0 2012+",12),(115,"Sensor Rotacao — HB20 1.0",12),
    (116,"Sensor Temperatura — Gol G5",12),(117,"Bomba Combustivel Eletrica — Uno",12),
    (118,"Alternador 70A — Gol G5 1.0",12),(119,"Motor Partida — Palio 1.0 Fire",12),
    (120,"Sensor Fase Comando — Fox 1.6",12),(121,"Corpo Borboleta — HB20 1.6",12),
    (122,"Bico Injetor Gasolina — Palio 1.0",12),
    (123,"Compressor Ar-Cond. — Gol G5 1.6",13),(124,"Condensador Ar — Onix 1.4",13),
    (125,"Evaporador Ar — Palio 1.0 Fire",13),(126,"Filtro Cabine — Gol/Fox/Voyage",13),
    (127,"Ventilador Ar-Condicionado — Palio",13),(128,"Pressostato Ar-Condicionado Universal",13),
    (129,"Abafador Intermediario — Palio 1.0",14),(130,"Abafador Traseiro — Gol G5",14),
    (131,"Catalisador — Corsa 1.0 2004",14),(132,"Coletor Escape — Onix 1.4",14),
    (133,"Ponteira Cromada 63mm Universal",14),(134,"Silencioso Dianteiro — Fiorino 1.3",14),
    (135,"Flexivel Escapamento — Palio Weekend",14),(136,"Sensor Oxigenio — Uno 1.0",14),
]

# ═══════════════════════════════════════════════════════
# PRECISE EXISTING IMAGE MAPPING
# Only map where product TYPE matches image TYPE exactly
# ═══════════════════════════════════════════════════════
def build_exact_map():
    """Build IMG_MAP with exact-match-only entries from existing assets."""
    m = {}

    # Helper: name starts with keyword (case-insensitive, ignoring special chars)
    def name_starts(pid, keyword):
        nome = dict(PRODUCTS)[pid].lower()
        keyword = keyword.lower().replace("'", "").replace('"', '').replace('-', ' ')
        return nome.startswith(keyword) or nome.startswith(keyword + ' ') or nome.startswith(keyword + '—')

    def name_has(pid, keyword):
        nome = dict(PRODUCTS)[pid].lower()
        keyword = keyword.lower().replace("'", "").replace('"', '')
        return keyword in nome

    # Bateria images → only true battery products
    for pid, nome, _ in PRODUCTS:
        if nome.lower().startswith('bateria'):
            for img_name in ['bateria_geral','bateria','bateria2','bateria3','bateria4','bateria5','bateria6']:
                if pid not in m and os.path.exists(os.path.join(ASSETS, img_name + '.png')):
                    m[pid] = img_name

    # Amortecedor images → only true shock absorber products
    for pid, nome, _ in PRODUCTS:
        if any(k in nome.lower() for k in ['amortecedor', 'kit amortecedor', 'kit 4 amortecedores']):
            for img_name in ['amortecedor','amortecedor2','amortecedor3','amortecedor4']:
                if pid not in m and os.path.exists(os.path.join(ASSETS, img_name + '.png')):
                    m[pid] = img_name

    # Bandeja → bandeja product
    for pid, nome, _ in PRODUCTS:
        if 'bandeja' in nome.lower() and pid not in m:
            if os.path.exists(os.path.join(ASSETS, 'bandeja.png')):
                m[pid] = 'bandeja'

    # Bieleta → bieleta product
    for pid, nome, _ in PRODUCTS:
        if 'bieleta' in nome.lower() and pid not in m:
            if os.path.exists(os.path.join(ASSETS, 'bieleta.png')):
                m[pid] = 'bieleta'

    # Pastilha images → only brake pad products
    for pid, nome, _ in PRODUCTS:
        if nome.lower().startswith('pastilha'):
            for img_name in ['pastilha1','pastilha2','pastilha3']:
                if pid not in m and os.path.exists(os.path.join(ASSETS, img_name + '.png')):
                    m[pid] = img_name

    # Disco de Freio images → only brake disc products
    for pid, nome, _ in PRODUCTS:
        if 'disco de freio' in nome.lower() or nome.lower().startswith('disco freio'):
            for img_name in ['disco_freio','disco_freio2']:
                if pid not in m and os.path.exists(os.path.join(ASSETS, img_name + '.png')):
                    m[pid] = img_name

    # Kit Completo Freio → kit_freio image
    for pid, nome, _ in PRODUCTS:
        if 'kit completo freio' in nome.lower() and pid not in m:
            if os.path.exists(os.path.join(ASSETS, 'kit_freio.png')):
                m[pid] = 'kit_freio'

    # Oleo images → only oil products
    for pid, nome, _ in PRODUCTS:
        n = nome.lower()
        if n.startswith('oleo motor 5w30') or n.startswith('oleo 5w30'):
            if os.path.exists(os.path.join(ASSETS, 'oleo5w30.png')) and pid not in m:
                m[pid] = 'oleo5w30'
        elif n.startswith('oleo motor 20w50') or n.startswith('oleo 20w50'):
            if os.path.exists(os.path.join(ASSETS, 'oleo20w50.png')) and pid not in m:
                m[pid] = 'oleo20w50'
        elif 'castrol' in n or '10w40' in n:
            if os.path.exists(os.path.join(ASSETS, 'oleo_castrol.png')) and pid not in m:
                m[pid] = 'oleo_castrol'
        elif n.startswith('oleo 15w40') or 'petronas' in n:
            if os.path.exists(os.path.join(ASSETS, 'oleo20w50.png')) and pid not in m:
                m[pid] = 'oleo20w50'

    # Filtro de Oleo → filtro_oleo image
    for pid, nome, _ in PRODUCTS:
        if 'filtro de oleo' in nome.lower() and pid not in m:
            if os.path.exists(os.path.join(ASSETS, 'filtro_oleo.png')):
                m[pid] = 'filtro_oleo'

    # Filtro de Ar → filtro_ar images
    for pid, nome, _ in PRODUCTS:
        if 'filtro de ar' in nome.lower() and pid not in m:
            if os.path.exists(os.path.join(ASSETS, 'filtro_ar_real.png')):
                m[pid] = 'filtro_ar_real'
            elif os.path.exists(os.path.join(ASSETS, 'filtro_ar.png')):
                m[pid] = 'filtro_ar'

    # Filtro de Combustivel → filtro_comb image
    for pid, nome, _ in PRODUCTS:
        if 'filtro de combustivel' in nome.lower() and pid not in m:
            if os.path.exists(os.path.join(ASSETS, 'filtro_comb.png')):
                m[pid] = 'filtro_comb'

    # Homocinetica/Trizeta → homocinetica image
    for pid, nome, _ in PRODUCTS:
        if ('homocinetica' in nome.lower() or 'trizeta' in nome.lower()) and pid not in m:
            if os.path.exists(os.path.join(ASSETS, 'homocinetica.png')):
                m[pid] = 'homocinetica'

    # Caixa de Direcao → caixa_direcao image
    for pid, nome, _ in PRODUCTS:
        if 'caixa de direcao' in nome.lower() and pid not in m:
            if os.path.exists(os.path.join(ASSETS, 'caixa_direcao.png')):
                m[pid] = 'caixa_direcao'

    # Correia → correia image
    for pid, nome, _ in PRODUCTS:
        if nome.lower().startswith('correia') and pid not in m:
            if os.path.exists(os.path.join(ASSETS, 'correia.png')):
                m[pid] = 'correia'

    # Bomba d'Agua → bomba_agua image
    for pid, nome, _ in PRODUCTS:
        n = nome.lower().replace("'", "").replace("`", "").replace("’", "")
        if 'bomba dagua' in n or 'bomba agua' in n or n.startswith('bomba d') and pid not in m:
            if os.path.exists(os.path.join(ASSETS, 'bomba_agua.png')):
                m[pid] = 'bomba_agua'

    # Terminal Direcao → terminal image
    for pid, nome, _ in PRODUCTS:
        if nome.lower().startswith('terminal') and pid not in m:
            if os.path.exists(os.path.join(ASSETS, 'terminal.png')):
                m[pid] = 'terminal'

    # Palheta → palheta images
    for pid, nome, _ in PRODUCTS:
        if nome.lower().startswith('palheta'):
            if '18' in nome or '16"' in nome:
                if os.path.exists(os.path.join(ASSETS, 'palheta18.png')) and pid not in m:
                    m[pid] = 'palheta18'
            elif '20' in nome:
                if os.path.exists(os.path.join(ASSETS, 'palheta20.png')) and pid not in m:
                    m[pid] = 'palheta20'
            else:
                if pid not in m:
                    m[pid] = 'palheta18' if os.path.exists(os.path.join(ASSETS, 'palheta18.png')) else 'palheta20'

    # Capa Volante → capa_volante
    for pid, nome, _ in PRODUCTS:
        if 'capa volante' in nome.lower() and pid not in m:
            if os.path.exists(os.path.join(ASSETS, 'capa_volante.png')):
                m[pid] = 'capa_volante'

    # Perfume → perfume
    for pid, nome, _ in PRODUCTS:
        if 'perfume' in nome.lower() and pid not in m:
            if os.path.exists(os.path.join(ASSETS, 'perfume.png')):
                m[pid] = 'perfume'

    # Tapete → tapete
    for pid, nome, _ in PRODUCTS:
        if 'tapete' in nome.lower() and pid not in m:
            if os.path.exists(os.path.join(ASSETS, 'tapete.png')):
                m[pid] = 'tapete'

    # Farol → farol image (but NOT farol de milha)
    for pid, nome, _ in PRODUCTS:
        n = nome.lower()
        if n.startswith('farol dianteiro') and pid not in m:
            if os.path.exists(os.path.join(ASSETS, 'farol.png')):
                m[pid] = 'farol'

    # Farol de Milha → farol_milha
    for pid, nome, _ in PRODUCTS:
        if 'farol de milha' in nome.lower() and pid not in m:
            if os.path.exists(os.path.join(ASSETS, 'farol_milha.png')):
                m[pid] = 'farol_milha'

    # Lampada → lampada image
    for pid, nome, _ in PRODUCTS:
        n = nome.lower()
        if any(k in n for k in ['lampada', 'lâmpada', 'xenon', 'kit xenon']) and pid not in m:
            if os.path.exists(os.path.join(ASSETS, 'lampada.png')):
                m[pid] = 'lampada'

    # Corrente (comando) → corrente image
    for pid, nome, _ in PRODUCTS:
        if nome.lower().startswith('corrente') and pid not in m:
            if os.path.exists(os.path.join(ASSETS, 'corrente.png')):
                m[pid] = 'corrente'

    # Sensor → sensor image
    for pid, nome, _ in PRODUCTS:
        n = nome.lower()
        if n.startswith('sensor') and pid not in m:
            if os.path.exists(os.path.join(ASSETS, 'sensor.png')):
                m[pid] = 'sensor'

    # Bobina → bobina image
    for pid, nome, _ in PRODUCTS:
        if nome.lower().startswith('bobina') and pid not in m:
            if os.path.exists(os.path.join(ASSETS, 'bobina.png')):
                m[pid] = 'bobina'

    # Kit Revisao → kit_revisao
    for pid, nome, _ in PRODUCTS:
        if nome.lower().startswith('kit revisao') and pid not in m:
            if os.path.exists(os.path.join(ASSETS, 'kit_revisao.png')):
                m[pid] = 'kit_revisao'

    # Troca de Oleo → troca_oleo
    for pid, nome, _ in PRODUCTS:
        if nome.lower().startswith('troca de oleo') and pid not in m:
            if os.path.exists(os.path.join(ASSETS, 'troca_oleo.png')):
                m[pid] = 'troca_oleo'

    # Alinhamento → alinhamento
    for pid, nome, _ in PRODUCTS:
        if nome.lower().startswith('alinhamento') and pid not in m:
            if os.path.exists(os.path.join(ASSETS, 'alinhamento.png')):
                m[pid] = 'alinhamento'

    # Diagnostico → diagnostico
    for pid, nome, _ in PRODUCTS:
        if nome.lower().startswith('diagnostico') and pid not in m:
            if os.path.exists(os.path.join(ASSETS, 'diagnostico.png')):
                m[pid] = 'diagnostico'

    return m


def get_search_query(pid, nome, cat_id):
    """Build a very specific Portuguese search query."""
    # Get the base product name (before the — dash or brand suffix)
    base = nome.split('—')[0].strip().split('"')[0].strip()

    # Category-specific fallback keywords
    cat_defaults = {
        10: 'peça arrefecimento automotivo',
        11: 'embreagem automotiva',
        12: 'ignição automotiva',
        13: 'ar condicionado automotivo',
        14: 'escapamento automotivo',
    }

    # For very specific products, use the exact name
    specific_terms = {
        16: 'pivo suspensão dianteiro palio',
        17: 'coxim amortecedor dianteiro hb20',
        18: 'barra estabilizadora dianteira onix',
        19: 'kit suspensão completa fox',
        26: 'lona freio traseira fiorino',
        27: 'cilindro freio traseiro uno',
        28: 'fluido freio dot4 500ml',
        29: 'disco freio traseiro corolla',
        39: 'aditivo radiador paraflu',
        46: 'trizeta homocinetica s10',
        47: 'jogo velas ignição ngk iridium hb20',
        48: 'tampa valvula motor gol ea111',
        49: 'junta cabeçote fiat fire',
        56: 'suporte celular ventosa universal automotivo',
        57: 'kit emergência triângulo sinalização automotivo',
        58: 'retrovisor interno panorâmico 300mm',
        59: 'organizador porta malas automotivo',
        61: 'lanterna traseira gol g5',
        65: 'lanterna traseira onix 2016',
        68: 'lanterna teto led 48smd carga automotivo',
        69: 'pisca retrovisor hb20',
        73: 'rolamento roda dianteira cruze',
        75: 'bomba combustível elétrica l200',
        77: 'bico injetor diesel sprinter',
        78: 'válvula egr corolla',
        79: 'corpo borboleta ducato 2.3',
        85: 'recarga ar condicionado automotivo r134a',
        86: 'troca pastilha disco freio serviço',
        87: 'troca embreagem serviço',
        88: 'limpeza bico injetor ultrassônica',
        89: 'geometria cambagem automotiva',
        90: 'radiador motor gol g5',
        91: 'radiador onix',
        92: 'ventoinha radiador palio',
        93: 'reservatório água radiador gol',
        95: 'mangueira radiador superior gol',
        96: 'válvula termostática onix',
        97: 'tampa reservatório expansão gol',
        98: 'radiador ar quente caminhão',
        99: 'eletroventilador 12v universal',
        100: 'intercooler hilux 3.0 d4d',
        101: 'kit embreagem completo gol g5',
        102: 'kit embreagem palio fire',
        103: 'disco embreagem s10 diesel',
        104: 'plato embreagem hb20',
        105: 'atuador embreagem hidraulico fox',
        106: 'cabo embreagem celta',
        107: 'kit embreagem reforçado ranger',
        108: 'cilindro mestre embreagem gol',
        109: 'cilindro auxiliar embreagem s10',
        110: 'garfo embreagem strada',
        111: 'rolamento embreagem uno',
        112: 'vela ignição ngk gol',
        113: 'cabo vela palio fire',
        114: 'bobina ignição onix',
        115: 'sensor rotação virabrequim hb20',
        116: 'sensor temperatura líquido arrefecimento gol',
        117: 'bomba combustível elétrica uno',
        118: 'alternador 70a gol g5',
        119: 'motor partida palio fire',
        120: 'sensor fase comando fox',
        121: 'corpo borboleta eletrônico hb20',
        122: 'bico injetor gasolina palio',
        123: 'compressor ar condicionado gol g5',
        124: 'condensador ar condicionado onix',
        125: 'evaporador ar condicionado palio',
        126: 'filtro cabine gol fox',
        127: 'ventilador ar condicionado palio',
        128: 'pressostato ar condicionado universal',
        129: 'abafador intermediário palio',
        130: 'abafador traseiro gol g5',
        131: 'catalisador corsa 1.0',
        132: 'coletor escape onix 1.4',
        133: 'ponteira cromada escapamento 63mm',
        134: 'silencioso dianteiro fiorino',
        135: 'flexível escapamento palio',
        136: 'sonda lambda sensor oxigênio uno',
    }

    if pid in specific_terms:
        return specific_terms[pid]
    # Fallback: use product name
    return f"{base} automotivo"


def download_image(url, dest_path):
    """Download an image, validate it, convert to PNG. Returns True on success."""
    try:
        resp = requests.get(url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        }, timeout=15)
        if resp.status_code != 200:
            return False

        img_data = resp.content
        if len(img_data) < 1024:
            return False  # too small

        # Verify it's a valid image
        try:
            img = Image.open(BytesIO(img_data))
            img.load()
        except Exception:
            return False

        # Check minimum dimensions
        if img.width < 50 or img.height < 50:
            return False

        # Convert to PNG (handles JPG, WebP, GIF, etc.)
        if img.mode in ('RGBA', 'LA', 'P'):
            png_img = img.convert('RGBA')
        else:
            png_img = img.convert('RGB')

        png_img.save(dest_path, 'PNG')
        return True
    except Exception as e:
        print(f"    Download error: {type(e).__name__}")
        return False


def search_and_download(pid, nome, cat_id):
    """Search DuckDuckGo for a product image and download it as PNG."""
    query = get_search_query(pid, nome, cat_id)
    safe = re.sub(r'[^a-z0-9]+', '_', query.split('automotivo')[0].strip()[:35].lower()).strip('_')
    fname = f"prod_{pid:03d}_{safe}"

    # Skip if PNG already exists
    if os.path.exists(os.path.join(ASSETS, fname + '.png')):
        return fname

    print(f"  [{pid:03d}] Searching: {query[:60]}...")
    try:
        with DDGS() as ddgs:
            results = list(ddgs.images(query, max_results=5))
    except Exception as e:
        print(f"    DDGS error: {e}")
        time.sleep(3)
        return None

    if not results:
        print(f"    No results")
        return None

    for r in results:
        url = r.get('image')
        if not url or not url.startswith('http'):
            continue

        dest = os.path.join(ASSETS, fname + '.png')
        if download_image(url, dest):
            print(f"    OK -> {fname}.png")
            return fname
        continue

    return None


def update_main_js(img_map):
    """Replace IMG_MAP in main.js with complete mapping."""
    with open(MAIN_JS, 'r', encoding='utf-8') as f:
        content = f.read()

    entries = [f'        {pid}:\'{img}\'' for pid, img in sorted(img_map.items())]
    new_map = '        var IMG_MAP = {\n' + ',\n'.join(entries) + '\n    };'

    # Simple string replacement (current IMG_MAP is on one line)
    old = 'var IMG_MAP = {33:\'filtro_ar_real\'};'
    if old in content:
        new_content = content.replace(old, new_map.lstrip())
    else:
        # Fallback: regex
        import re as re2
        pattern = r'var IMG_MAP = \{[\s\S]*?\};'
        new_content = re2.sub(pattern, new_map, content)

    with open(MAIN_JS, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f"\n[OK] main.js updated with {len(img_map)} image mappings")


def main():
    # Phase 1: Build exact mappings from existing assets
    img_map = build_exact_map()
    print(f"Exact matches from existing assets: {len(img_map)}")

    # Phase 2: Search for missing images
    search_ids = {pid for pid, _, _ in PRODUCTS if pid not in img_map}
    print(f"Products needing image search: {len(search_ids)}")
    print("=" * 60)

    for pid, nome, cat_id in PRODUCTS:
        if pid not in search_ids:
            continue

        result = search_and_download(pid, nome, cat_id)
        if result:
            img_map[pid] = result
        time.sleep(1.5)  # rate limiting

    # Report
    total = len(PRODUCTS)
    mapped = len(img_map)
    print(f"\n{'='*60}")
    print(f"Total products: {total}")
    print(f"Mapped: {mapped}")
    print(f"Missing: {total - mapped}")
    print(f"Existing assets used: {sum(1 for v in img_map.values() if not v.startswith('prod_'))}")
    print(f"New downloads: {sum(1 for v in img_map.values() if v.startswith('prod_'))}")

    # Save reference files
    os.makedirs(os.path.join(PROJECT, 'scripts'), exist_ok=True)
    with open(os.path.join(PROJECT, 'scripts', 'img_map_v2.json'), 'w') as f:
        json.dump({str(k): v for k, v in img_map.items()}, f, indent=2)

    # Update main.js
    update_main_js(img_map)

if __name__ == '__main__':
    main()
