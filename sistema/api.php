<?php
/* ============================================================
   CHEFÃO AUTOPEÇAS - JSON REST API
   ============================================================ */
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$action = isset($_GET['action']) ? $_GET['action'] : '';

$db = getDB();
if (!$db) {
    jsonResponse(false, null, 'Erro de conexão com o banco de dados.');
}

switch ($action) {

    // ============================================================
    // GET CATEGORIES
    // ============================================================
    case 'categorias':
        try {
            $stmt = $db->query("
                SELECT c.*, (SELECT COUNT(*) FROM produtos p WHERE p.categoria_id = c.id AND p.ativo = 1) as total
                FROM categorias c
                ORDER BY c.ordem ASC
            ");
            $categorias = $stmt->fetchAll();
            jsonResponse(true, $categorias);
        } catch (Exception $é) {
            jsonResponse(false, null, 'Erro ao carregar categorias: ' . $é->getMessage());
        }
        break;

    // ============================================================
    // GET PRODUCTS (with optional filters)
    // ============================================================
    case 'produtos':
        try {
            $where = ['p.ativo = 1'];
            $params = [];

            // Filter by category
            if (!empty($_GET['categoria'])) {
                $where[] = 'p.categoria_id = :categoria';
                $params[':categoria'] = (int)$_GET['categoria'];
            }

            // Search
            if (!empty($_GET['q'])) {
                $term = '%' . $_GET['q'] . '%';
                $where[] = '(p.nome LIKE :q1 OR p.código LIKE :q2 OR p.descrição LIKE :q3)';
                $params[':q1'] = $term;
                $params[':q2'] = $term;
                $params[':q3'] = $term;
            }

            // Filter by destaque
            if (!empty($_GET['destaque'])) {
                $where[] = 'p.destaque = 1';
            }

            $sql = "SELECT p.id, p.nome, p.slug, p.código, p.categoria_id, 
                           SUBSTR(p.descrição, 1, 100) as descricao_curta, 
                           p.preco, p.preco_promocional, p.icone, p.destaque, p.estoque,
                           c.nome as categoria_nome
                    FROM produtos p 
                    LEFT JOIN categorias c ON p.categoria_id = c.id 
                    WHERE " . implode(' AND ', $where) . "
                    ORDER BY p.destaque DESC, p.data_cadastro DESC";
            
            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            $produtos = $stmt->fetchAll();

            // Format numeric values
            foreach ($produtos as &$p) {
                $p['preco'] = (float)$p['preco'];
                $p['preco_promocional'] = $p['preco_promocional'] ? (float)$p['preco_promocional'] : null;
                $p['estoque'] = (int)$p['estoque'];
                $p['destaque'] = (int)$p['destaque'];
            }

            jsonResponse(true, $produtos);
        } catch (Exception $é) {
            jsonResponse(false, null, 'Erro ao carregar produtos: ' . $é->getMessage());
        }
        break;

    // ============================================================
    // GET SINGLE PRODUCT
    // ============================================================
    case 'produto':
        try {
            $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
            if ($id <= 0) {
                jsonResponse(false, null, 'ID inválido.');
            }

            $stmt = $db->prepare("
                SELECT p.*, c.nome as categoria_nome
                FROM produtos p 
                LEFT JOIN categorias c ON p.categoria_id = c.id 
                WHERE p.id = :id AND p.ativo = 1
            ");
            $stmt->execute([':id' => $id]);
            $produto = $stmt->fetch();

            if (!$produto) {
                jsonResponse(false, null, 'Produto não encontrado.');
            }

            $produto['preco'] = (float)$produto['preco'];
            $produto['preco_promocional'] = $produto['preco_promocional'] ? (float)$produto['preco_promocional'] : null;
            $produto['estoque'] = (int)$produto['estoque'];
            $produto['destaque'] = (int)$produto['destaque'];

            jsonResponse(true, $produto);
        } catch (Exception $é) {
            jsonResponse(false, null, 'Erro ao carregar produto: ' . $é->getMessage());
        }
        break;

    // ============================================================
    // GET STATS (for admin)
    // ============================================================
    case 'stats':
        try {
            $stats = [];
            $stats['produtos'] = $db->query("SELECT COUNT(*) as total FROM produtos WHERE ativo = 1")->fetch()['total'];
            $stats['categorias'] = $db->query("SELECT COUNT(*) as total FROM categorias")->fetch()['total'];
            $stats['pedidos'] = $db->query("SELECT COUNT(*) as total FROM pedidos")->fetch()['total'];
            $stats['pedidos_novos'] = $db->query("SELECT COUNT(*) as total FROM pedidos WHERE status = 'novo'")->fetch()['total'];
            jsonResponse(true, $stats);
        } catch (Exception $é) {
            jsonResponse(false, null, 'Erro ao carregar estatísticas.');
        }
        break;

    // ============================================================
    // SUBMIT CONTACT FORM
    // ============================================================
    case 'contato':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            jsonResponse(false, null, 'Método não permitido.');
        }
        
        $nome = isset($_POST['nome']) ? trim($_POST['nome']) : '';
        $email = isset($_POST['email']) ? trim($_POST['email']) : '';
        $telefone = isset($_POST['telefone']) ? trim($_POST['telefone']) : '';
        $assunto = isset($_POST['assunto']) ? trim($_POST['assunto']) : '';
        $mensagem = isset($_POST['mensagem']) ? trim($_POST['mensagem']) : '';

        if (empty($nome) || empty($mensagem)) {
            jsonResponse(false, null, 'Preencha os campos obrigatórios.');
        }

        // Send email notification
        $to = EMAIL;
        $subject = "Contato - Chefão Autopeças: $assunto";
        $body = "Nome: $nome\nEmail: $email\nTelefone: $telefone\n\nMensagem:\n$mensagem";
        mail($to, $subject, $body);

        jsonResponse(true, null, 'Mensagem enviada com sucesso! Entraremos em contato em breve.');
        break;

    default:
        jsonResponse(false, null, 'Ação não encontrada. Use: categorias, produtos, produto, stats, contato');
}
