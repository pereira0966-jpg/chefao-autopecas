<?php
/* ============================================================
   CHEFÃO AUTOPEÇAS - Configuration & Database
   ============================================================ */

// Error reporting (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Headers
header('Content-Type: text/html; charset=utf-8');
header('X-Content-Type-Options: nosniff');

// Database path
define('DB_PATH', __DIR__ . '/db/loja.db');

// ============================================================
// COMPANY INFO (based on real data from Instagram @chefaoautopecas)
// ============================================================
define('SITE_NAME', 'Chefão Autopeças');
define('SITE_DESC', 'Auto peças nacionais é importadas — Atendimento técnico especializado em Duque de Caxias é região');
define('SITE_URL', 'https://www.chefaoautopecas.com.br');
define('WHATSAPP', '5521994325697');
define('WHATSAPP_LINK', 'https://wa.me/5521994325697');
define('INSTAGRAM', 'https://www.instagram.com/chefaoautopecas/');
define('INSTAGRAM_USER', '@chefaoautopecas');
define('EMAIL', 'contato@chefaoautopecas.com.br');
define('TELEFONE', '(21) 99432-5697');
define('ENDERECO', 'Av. Automóvel Clube, 2328 — Parque Paulista — Duque de Caxias/RJ');
define('HORARIO_SEGSEX', '8h30 às 17h30');
define('HORARIO_SAB', '8h às 14h');

// Admin credentials
define('ADMIN_USER', 'admin');
// Default password: admin123 (change immediately!)
define('ADMIN_PASS_HASH', password_hash('admin123', PASSWORD_DEFAULT));

// ============================================================
// Database Connection & Initialization
// ============================================================
function getDB() {
    static $db = null;
    if ($db === null) {
        try {
            $dbDir = dirname(DB_PATH);
            if (!is_dir($dbDir)) {
                mkdir($dbDir, 0755, true);
            }
            $db = new PDO('sqlite:' . DB_PATH);
            $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            $db->exec('PRAGMA journal_mode=WAL');
            $db->exec('PRAGMA foreign_keys=ON');
            initDatabase($db);
        } catch (PDOException $é) {
            error_log('DB Error: ' . $é->getMessage());
            return null;
        }
    }
    return $db;
}

function initDatabase($db) {
    $db->exec("
        CREATE TABLE IF NOT EXISTS categorias (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            icone TEXT DEFAULT 'fas fa-car',
            descrição TEXT,
            ordem INTEGER DEFAULT 0
        )
    ");

    $db->exec("
        CREATE TABLE IF NOT EXISTS produtos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            código TEXT,
            categoria_id INTEGER,
            descrição TEXT,
            especificações TEXT,
            preco REAL NOT NULL DEFAULT 0,
            preco_promocional REAL,
            icone TEXT DEFAULT 'fas fa-car',
            estoque INTEGER DEFAULT 0,
            destaque INTEGER DEFAULT 0,
            ativo INTEGER DEFAULT 1,
            data_cadastro TEXT DEFAULT (datetime('now','localtime')),
            FOREIGN KEY (categoria_id) REFERENCES categorias(id)
        )
    ");

    $db->exec("
        CREATE TABLE IF NOT EXISTS pedidos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cliente_nome TEXT,
            cliente_telefone TEXT,
            cliente_email TEXT,
            itens TEXT,
            total REAL,
            status TEXT DEFAULT 'novo',
            observacao TEXT,
            data_criacao TEXT DEFAULT (datetime('now','localtime'))
        )
    ");

    $db->exec("
        CREATE TABLE IF NOT EXISTS admin (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario TEXT UNIQUE NOT NULL,
            senha_hash TEXT NOT NULL
        )
    ");

    // Insert default admin if not exists
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM admin WHERE usuario = ?");
    $stmt->execute([ADMIN_USER]);
    $row = $stmt->fetch();
    if ($row['total'] == 0) {
        $stmt = $db->prepare("INSERT INTO admin (usuario, senha_hash) VALUES (?, ?)");
        $stmt->execute([ADMIN_USER, ADMIN_PASS_HASH]);
    }

    // Insert sample data if categories are empty
    $stmt = $db->query("SELECT COUNT(*) as total FROM categorias");
    $row = $stmt->fetch();
    if ($row['total'] == 0) {
        insertSampleData($db);
    }
}

function insertSampleData($db) {
    // Real categories based on Instagram posts
    $categorias = [
        ['nome' => 'Baterias',             'slug' => 'baterias',             'icone' => 'fas fa-bolt',          'descrição' => 'Baterias automotivas para todas as marcas é modelos'],
        ['nome' => 'Suspensão',            'slug' => 'suspensão',            'icone' => 'fas fa-car',           'descrição' => 'Amortecedores, molas, bandejas é peças de suspensão'],
        ['nome' => 'Freios',               'slug' => 'freios',               'icone' => 'fas fa-stop-circle',   'descrição' => 'Pastilhas, discos, fluídos é componentes de freio'],
        ['nome' => 'Óleos é Filtros',      'slug' => 'óleos-é-filtros',      'icone' => 'fas fa-oil-can',       'descrição' => 'Óleos lubrificantes, filtros de óleo, ar é combustível'],
        ['nome' => 'Motor é Direção',      'slug' => 'motor-é-direção',      'icone' => 'fas fa-cog',           'descrição' => 'Homocinética, caixa de direção, componentes do motor'],
        ['nome' => 'Palhetas é Acessórios', 'slug' => 'palhetas-acessorios', 'icone' => 'fas fa-umbrella',      'descrição' => 'Palhetas de chuva, capas de volante, perfumes automotivos'],
        ['nome' => 'Peças Importadas',      'slug' => 'peças-importadas',    'icone' => 'fas fa-globe',         'descrição' => 'Peças importadas para veículos de todas as marcas'],
        ['nome' => 'Serviços',             'slug' => 'servicos',             'icone' => 'fas fa-tools',         'descrição' => 'Revisão preventiva, corretiva, troca de óleo é manutenção geral'],
    ];

    $insertCat = $db->prepare("INSERT INTO categorias (nome, slug, icone, descrição, ordem) VALUES (?, ?, ?, ?, ?)");
    foreach ($categorias as $i => $cat) {
        $insertCat->execute([$cat['nome'], $cat['slug'], $cat['icone'], $cat['descrição'], $i + 1]);
    }

    // Realistic products based on Instagram posts
    $produtos = [
        ['Bateria 60Ah Cral — Gol/Fox/Polo', 'bateria-60ah-cral', 'BT-001', 1, 'Bateria automotiva 60Ah de alta durabilidade para carros populares. Ideal para Gol, Fox, Polo é similares.', '{"Capacidade":"60Ah","Tensão":"12V","Garantia":"24 meses","Aplicação":"Gol, Fox, Polo, Saveiro"}', 349.90, 299.90, 'fas fa-bolt'],
        ['Bateria 45Ah — Uno/Mobi/Onix', 'bateria-45ah-uno', 'BT-002', 1, 'Bateria compacta 45Ah para veículos de entrada. Perfeita para Uno, Mobi, Onix é Ka.', '{"Capacidade":"45Ah","Tensão":"12V","Garantia":"18 meses","Aplicação":"Uno, Mobi, Onix, Ka"}', 269.90, null, 'fas fa-bolt'],
        ['Pastilha de Freio — Uno Way 1.4', 'pastilha-freio-uno-way', 'FR-001', 3, 'Pastilha de freio dianteira para Fiat Uno Way 1.4 é similares. Qualidade original com alto poder de frenagem.', '{"Aplicação":"Fiat Uno Way 1.4","Material":"Semi-metálico","Garantia":"12 meses","Posição":"Dianteira"}', 79.90, 69.90, 'fas fa-stop-circle'],
        ['Pastilha de Freio — Gol G5/G6', 'pastilha-freio-gol-g5', 'FR-002', 3, 'Pastilha de freio para Volkswagen Gol G5/G6. Componente de alta resistência é durabilidade.', '{"Aplicação":"VW Gol G5/G6","Material":"Semi-metálico","Garantia":"12 meses","Posição":"Dianteira"}', 89.90, 79.90, 'fas fa-stop-circle'],
        ['Disco de Freio Ventilado — Gol/Fox', 'disco-freio-gol-fox', 'FR-003', 3, 'Disco de freio ventilado original para VW Gol, Fox é Saveiro. Alto poder de dissipação térmica.', '{"Aplicação":"VW Gol/Fox/Saveiro","Diâmetro":"256mm","Tipo":"Ventilado","Garantia":"12 meses"}', 129.90, null, 'fas fa-compact-disc'],
        ['Amortecedor Dianteiro — Gol G5/G6', 'amortecedor-dianteiro-gol', 'SP-001', 2, 'Amortecedor hidráulico dianteiro para VW Gol G5/G6. Conforto é estabilidade na direção.', '{"Aplicação":"VW Gol G5/G6","Tipo":"Hidráulico","Garantia":"6 meses","Posição":"Dianteiro"}', 199.90, 179.90, 'fas fa-car'],
        ['Kit Amortecedor Traseiro — Gol', 'kit-amortecedor-traseiro-gol', 'SP-002', 2, 'Par de amortecedores traseiros para Volkswagen Gol. Segurança é conforto para sua viagem.', '{"Aplicação":"VW Gol","Tipo":"Hidráulico","Garantia":"6 meses","Posição":"Traseiro"}', 219.90, null, 'fas fa-car'],
        ['Óleo Motor 5W30 Sintético 1L', 'óleo-motor-5w30', 'OL-001', 4, 'Óleo lubrificante sintético 5W30 para motores flex. Proteção superior é menor desgaste.', '{"Viscosidade":"5W30","Tipo":"Sintético","Volume":"1 Litro","Aplicação":"Motores Flex"}', 39.90, 34.90, 'fas fa-tint'],
        ['Óleo Motor 20W50 Mineral 1L', 'óleo-motor-20w50', 'OL-002', 4, 'Óleo lubrificante mineral 20W50 para motores mais antigos. Proteção confiável é economia.', '{"Viscosidade":"20W50","Tipo":"Mineral","Volume":"1 Litro","Aplicação":"Motores Antigos"}', 29.90, null, 'fas fa-tint'],
        ['Filtro de Óleo — Gol/Uno/Onix', 'filtro-óleo-universal', 'FL-001', 4, 'Filtro de óleo automotivo compatível com Gol, Uno, Onix, Ka é outros populares.', '{"Rosca":"3/4\\\"","Aplicação":"Universal - Gol, Uno, Onix, Ka","Garantia":"6 meses"}', 24.90, null, 'fas fa-filter'],
        ['Filtro de Ar — Gol G5/Fox', 'filtro-ar-gol-g5', 'FL-002', 4, 'Filtro de ar do motor para VW Gol G5, Fox é Saveiro. Mantém o motor limpo é eficiente.', '{"Aplicação":"VW Gol G5/Fox/Saveiro","Tipo":"Seco","Garantia":"6 meses"}', 34.90, 29.90, 'fas fa-filter'],
        ['Homocinética Completa — Gol/Fox', 'homocinetica-completa-gol', 'MD-001', 5, 'Homocinética completa (junta + coifa + graxa) para VW Gol, Fox é Saveiro. Transmissão suave é sem ruídos.', '{"Aplicação":"VW Gol/Fox/Saveiro","Itens":"Junta + Coifa + Graxa","Garantia":"12 meses"}', 189.90, 159.90, 'fas fa-cog'],
        ['Caixa de Direção — Gol G5/G6', 'caixa-direção-gol-g5', 'MD-002', 5, 'Caixa de direção mecânica para Volkswagen Gol G5/G6. Direção precisa é segura.', '{"Aplicação":"VW Gol G5/G6","Tipo":"Mecânica","Garantia":"12 meses"}', 459.90, 399.90, 'fas fa-cogs'],
        ['Palheta de Chuva Universal 18\"', 'palheta-chuva-18', 'AC-001', 6, 'Palheta de chuva universal 18 polegadas. Limpeza uniforme é silenciosa para seu para-brisa.', '{"Tamanho":"18\\\" (450mm)","Tipo":"Universal","Material":"Borracha + Aço","Embalagem":"Par"}', 29.90, 24.90, 'fas fa-umbrella'],
        ['Palheta de Chuva Universal 20\"', 'palheta-chuva-20', 'AC-002', 6, 'Palheta de chuva universal 20 polegadas. Instalação fácil é durabilidade prolongada.', '{"Tamanho":"20\\\" (500mm)","Tipo":"Universal","Material":"Borracha + Aço","Embalagem":"Par"}', 32.90, null, 'fas fa-umbrella'],
        ['Capa de Volante Universal Couro', 'capa-volante-couro', 'AC-003', 6, 'Capa de volante em couro sintético universal. Conforto é estilo para seu carro.', '{"Aplicação":"Universal","Material":"Couro Sintético","Cor":"Preto","Diâmetro":"38cm"}', 49.90, 39.90, 'fas fa-steering-wheel'],
        ['Perfume Automotivo Glicério', 'perfume-automotivo-glicerio', 'AC-004', 6, 'Perfume automotivo Glicério com fragrância duradoura. Diversos aromas disponíveis.', '{"Marca":"Glicério","Duração":"Até 60 dias","Aroma":"Sortido","Tipo":"Gel"}', 19.90, 14.90, 'fas fa-spray-can'],
        ['Kit Revisão Preventiva — Gol 1.0', 'kit-revisao-preventiva-gol', 'SV-001', 8, 'Kit completo para revisão preventiva: óleo 5W30 (3L) + filtro óleo + filtro ar + mão de obra. Seu carro sairia zerado!', '{"Aplicação":"VW Gol 1.0","Inclui":"Óleo 5W30 3L + Filtro Óleo + Filtro Ar + MO","Garantia":"3 meses"}', 299.90, 249.90, 'fas fa-tools'],
    ];

    $insertProd = $db->prepare("INSERT INTO produtos (nome, slug, código, categoria_id, descrição, especificações, preco, preco_promocional, icone, destaque, estoque) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 10)");
    
    foreach ($produtos as $p) {
        $insertProd->execute([$p[0], $p[1], $p[2], $p[3], $p[4], $p[5], $p[6], $p[7], $p[8]]);
    }
}

// JSON response helper
function jsonResponse($success, $data = null, $message = '') {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => $success,
        'data' => $data,
        'message' => $message
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
