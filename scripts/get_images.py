"""Fetch missing product images from DuckDuckGo and update IMG_MAP in main.js"""
import os, sys, re, json, time
from io import BytesIO
from PIL import Image
import requests
from ddgs import DDGS

PROJECT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(PROJECT, 'assets')
MAIN_JS = os.path.join(PROJECT, 'js', 'main.js')
os.makedirs(ASSETS, exist_ok=True)

# ── Full product list (pid, nome, cat_id) ──
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

# ── Initial mapping using existing assets (covers categories 1-9) ──
INITIAL_MAP = {
    # Baterias (cat 1)
    1:'bateria_geral',2:'bateria2',3:'bateria3',4:'bateria4',5:'bateria5',
    6:'bateria6',7:'bateria',8:'bateria2',9:'bateria_geral',
    # Suspensao (cat 2)
    10:'amortecedor',11:'amortecedor2',12:'amortecedor3',13:'bandeja',14:'bieleta',
    15:'amortecedor4',16:'amortecedor',17:'amortecedor2',18:'bandeja',19:'amortecedor3',
    # Freios (cat 3)
    20:'pastilha1',21:'pastilha2',22:'disco_freio',23:'disco_freio2',24:'pastilha3',
    25:'kit_freio',26:'pastilha1',27:'pastilha2',28:'disco_freio',29:'disco_freio2',
    # Oleos e Filtros (cat 4)
    30:'oleo5w30',31:'oleo20w50',32:'filtro_oleo',33:'filtro_ar_real',34:'filtro_comb',
    35:'oleo_castrol',36:'filtro_oleo',37:'filtro_ar',38:'oleo20w50',39:'oleo5w30',
    # Motor e Direcao (cat 5)
    40:'homocinetica',41:'caixa_direcao',42:'correia',43:'bomba_agua',44:'terminal',
    45:'correia',46:'homocinetica',47:'bobina',48:'caixa_direcao',49:'correia',
    # Palhetas e Acessorios (cat 6)
    50:'palheta18',51:'palheta20',52:'capa_volante',53:'perfume',54:'tapete',
    55:'palheta18',56:'tapete',57:'capa_volante',58:'perfume',59:'tapete',
    # Iluminacao (cat 7)
    60:'farol',61:'farol',62:'lampada',63:'farol_milha',64:'lampada',
    65:'farol',66:'lampada',67:'farol_milha',68:'lampada',69:'farol',
    # Pecas Importadas (cat 8)
    70:'corrente',71:'sensor',72:'bobina',73:'sensor',74:'sensor',
    75:'bobina',76:'sensor',77:'bobina',78:'sensor',79:'bobina',
    # Servicos (cat 9)
    80:'kit_revisao',81:'troca_oleo',82:'alinhamento',83:'diagnostico',84:'correia',
    85:'kit_revisao',86:'kit_freio',87:'kit_revisao',88:'diagnostico',89:'alinhamento',
    # Arrefecimento (cat 10) — reuse bomba_agua where relevant
    90:'bomba_agua',91:'bomba_agua',92:'bomba_agua',93:'bomba_agua',94:'bomba_agua',
    95:'bomba_agua',96:'bomba_agua',97:'bomba_agua',98:'bomba_agua',99:'bomba_agua',
    100:'bomba_agua',
    # Ignição e Injecao (cat 12) — reuse bobina
    112:'bobina',113:'bobina',114:'bobina',115:'bobina',116:'bobina',
    117:'bobina',118:'bobina',119:'bobina',120:'bobina',121:'bobina',122:'bobina',
}

def search_image(pid, nome, cat_id):
    """Search DuckDuckGo and download first image result."""
    # Build query from product name
    nome_clean = nome.split('—')[0].strip().split('"')[0].split("'")[0]
    query = f"{nome_clean} automotivo"

    # Category-based fallbacks
    cat_queries = {
        11: 'kit embreagem automotivo',
        13: 'compressor ar condicionado automotivo',
        14: 'escapamento automotivo',
    }
    if cat_id in cat_queries:
        query = cat_queries[cat_id]

    # Generate safe filename
    safe = re.sub(r'[^a-z0-9]+', '_', nome_clean.lower()[:40]).strip('_')
    fname = f"prod_{pid}_{safe}"

    # Skip if image already exists
    for ext in ('.png','.jpg','.webp'):
        if os.path.exists(os.path.join(ASSETS, fname + ext)):
            return fname

    print(f"  [{pid}] Searching: {nome[:50]}...")
    try:
        with DDGS() as ddgs:
            results = list(ddgs.images(query, max_results=5))
    except Exception as e:
        print(f"    DDGS error: {e}")
        time.sleep(5)
        return None

    if not results:
        print(f"    No results")
        return None

    for r in results:
        url = r.get('image')
        if not url or not url.startswith('http'):
            continue

        # Determine extension
        ext = '.jpg'
        for e in ('.png','.jpg','.jpeg','.webp'):
            if e in url.lower():
                ext = e if e != '.jpeg' else '.jpg'
                break

        dest = os.path.join(ASSETS, fname + ext)
        try:
            resp = requests.get(url, headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
            }, timeout=15)
            if resp.status_code != 200:
                continue

            # Verify image
            img = Image.open(BytesIO(resp.content))
            img.verify()

            with open(dest, 'wb') as f:
                f.write(resp.content)

            # Convert JPG to PNG for consistency
            if ext == '.jpg':
                try:
                    img = Image.open(dest).convert('RGBA')
                    png_dest = os.path.join(ASSETS, fname + '.png')
                    img.save(png_dest, 'PNG')
                    os.remove(dest)
                except:
                    pass

            print(f"    OK -> {fname}.png")
            return fname
        except Exception as e:
            print(f"    Download failed: {type(e).__name__}")
            continue

    return None


def update_main_js(img_map):
    """Replace IMG_MAP in main.js with the complete mapping."""
    with open(MAIN_JS, 'r', encoding='utf-8') as f:
        content = f.read()

    # Build new IMG_MAP JS code
    entries = [f'        {pid}:\'{img}\'' for pid, img in sorted(img_map.items())]
    new_map = '    var IMG_MAP = {\n' + ',\n'.join(entries) + '\n    };'

    # Replace existing IMG_MAP
    old_pattern = r'var IMG_MAP = \{[\s\S]*?\};'
    new_content = re.sub(old_pattern, new_map, content)

    with open(MAIN_JS, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f"\n[OK] main.js updated with {len(img_map)} image mappings")


def main():
    img_map = dict(INITIAL_MAP)

    # Only search for truly missing categories (11, 13, 14)
    search_ids = {pid for pid, _, cat in PRODUCTS if cat in (11, 13, 14)}

    print(f"Already mapped: {len(img_map)}")
    print(f"Need to search: {len(search_ids)} products (Embreagem, Ar Condicionado, Escapamento)")
    print("-" * 50)

    for pid, nome, cat_id in PRODUCTS:
        if pid not in search_ids:
            continue
        if pid in img_map:
            continue

        result = search_image(pid, nome, cat_id)
        if result:
            img_map[pid] = result
        time.sleep(2)  # rate limit

    # Report
    mapped = len(img_map)
    total = len(PRODUCTS)
    print(f"\n{'='*50}")
    print(f"Total: {total} | Mapped: {mapped} | Missing: {total-mapped}")

    # Save JSON for reference
    os.makedirs(os.path.join(PROJECT, 'scripts'), exist_ok=True)
    with open(os.path.join(PROJECT, 'scripts', 'img_map.json'), 'w') as f:
        json.dump({str(k): v for k, v in img_map.items()}, f, indent=2)

    # Update main.js
    update_main_js(img_map)

    # Also save the JS snippet
    entries = [f'    {pid}:\'{img}\'' for pid, img in sorted(img_map.items())]
    snippet = 'var IMG_MAP = {\n' + ',\n'.join(entries) + '\n};'
    snippet_path = os.path.join(PROJECT, 'scripts', 'img_map_snippet.js')
    with open(snippet_path, 'w') as f:
        f.write(snippet)
    print(f"Snippet saved to: {snippet_path}")

if __name__ == '__main__':
    main()
