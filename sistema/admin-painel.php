<?php
/* ============================================================
   CHEFÃO AUTOPEÇAS - Admin Panel
   ============================================================ */
require_once __DIR__ . '/auth.php';

$db = getDB();

// ============================================================
// Handle POST actions
// ============================================================
$msg = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isLoggedIn()) {
    try {
        $action = isset($_POST['action']) ? $_POST['action'] : '';

        switch ($action) {
            // ---- Add/Edit Product ----
            case 'salvar_produto':
                $id = isset($_POST['id']) ? (int)$_POST['id'] : 0;
                $nome = trim($_POST['nome'] ?? '');
                $slug = trim($_POST['slug'] ?? '');
                $código = trim($_POST['código'] ?? '');
                $categoria_id = (int)($_POST['categoria_id'] ?? 0);
                $descrição = trim($_POST['descrição'] ?? '');
                $especificações = trim($_POST['especificações'] ?? '');
                $preco = (float)($_POST['preco'] ?? 0);
                $preco_promocional = $_POST['preco_promocional'] !== '' ? (float)$_POST['preco_promocional'] : null;
                $icone = trim($_POST['icone'] ?? 'fas fa-car');
                $estoque = (int)($_POST['estoque'] ?? 0);
                $destaque = isset($_POST['destaque']) ? 1 : 0;
                $ativo = isset($_POST['ativo']) ? 1 : 0;

                if (empty($nome)) throw new Exception('Nome do produto é obrigatório.');
                if (empty($slug)) $slug = strtolower(preg_replace('/[^à-z0-9]+/', '-', transliterate($nome)));

                if ($id > 0) {
                    $stmt = $db->prepare("UPDATE produtos SET nome=:nome, slug=:slug, código=:código, categoria_id=:cat, descrição=:desc, especificações=:esp, preco=:preco, preco_promocional=:promo, icone=:icone, estoque=:est, destaque=:dest, ativo=:ativo WHERE id=:id");
                    $stmt->execute([':id' => $id, ':nome' => $nome, ':slug' => $slug, ':código' => $código, ':cat' => $categoria_id, ':desc' => $descrição, ':esp' => $especificações, ':preco' => $preco, ':promo' => $preco_promocional, ':icone' => $icone, ':est' => $estoque, ':dest' => $destaque, ':ativo' => $ativo]);
                    $msg = 'Produto atualizado com sucesso!';
                } else {
                    $stmt = $db->prepare("INSERT INTO produtos (nome, slug, código, categoria_id, descrição, especificações, preco, preco_promocional, icone, estoque, destaque, ativo) VALUES (:nome, :slug, :código, :cat, :desc, :esp, :preco, :promo, :icone, :est, :dest, :ativo)");
                    $stmt->execute([':nome' => $nome, ':slug' => $slug, ':código' => $código, ':cat' => $categoria_id, ':desc' => $descrição, ':esp' => $especificações, ':preco' => $preco, ':promo' => $preco_promocional, ':icone' => $icone, ':est' => $estoque, ':dest' => $destaque, ':ativo' => $ativo]);
                    $msg = 'Produto cadastrado com sucesso!';
                }
                break;

            // ---- Delete Product ----
            case 'excluir_produto':
                $id = (int)($_POST['id'] ?? 0);
                if ($id > 0) {
                    $stmt = $db->prepare("DELETE FROM produtos WHERE id = :id");
                    $stmt->execute([':id' => $id]);
                    $msg = 'Produto excluído.';
                }
                break;

            // ---- Save Category ----
            case 'salvar_categoria':
                $id = isset($_POST['id']) ? (int)$_POST['id'] : 0;
                $nome = trim($_POST['nome'] ?? '');
                $slug = trim($_POST['slug'] ?? '');
                $icone = trim($_POST['icone'] ?? 'fas fa-car');
                $descrição = trim($_POST['descrição'] ?? '');
                $ordem = (int)($_POST['ordem'] ?? 0);

                if (empty($nome)) throw new Exception('Nome da categoria é obrigatório.');
                if (empty($slug)) $slug = strtolower(preg_replace('/[^à-z0-9]+/', '-', transliterate($nome)));

                if ($id > 0) {
                    $stmt = $db->prepare("UPDATE categorias SET nome=:nome, slug=:slug, icone=:icone, descrição=:desc, ordem=:ordem WHERE id=:id");
                    $stmt->execute([':id' => $id, ':nome' => $nome, ':slug' => $slug, ':icone' => $icone, ':desc' => $descrição, ':ordem' => $ordem]);
                    $msg = 'Categoria atualizada!';
                } else {
                    $stmt = $db->prepare("INSERT INTO categorias (nome, slug, icone, descrição, ordem) VALUES (:nome, :slug, :icone, :desc, :ordem)");
                    $stmt->execute([':nome' => $nome, ':slug' => $slug, ':icone' => $icone, ':desc' => $descrição, ':ordem' => $ordem]);
                    $msg = 'Categoria criada!';
                }
                break;

            // ---- Delete Category ----
            case 'excluir_categoria':
                $id = (int)($_POST['id'] ?? 0);
                if ($id > 0) {
                    $db->prepare("UPDATE produtos SET categoria_id = NULL WHERE categoria_id = :id")->execute([':id' => $id]);
                    $db->prepare("DELETE FROM categorias WHERE id = :id")->execute([':id' => $id]);
                    $msg = 'Categoria excluída.';
                }
                break;

            // ---- Update Order Status ----
            case 'atualizar_pedido':
                $id = (int)($_POST['id'] ?? 0);
                $status = trim($_POST['status'] ?? '');
                if ($id > 0 && $status) {
                    $stmt = $db->prepare("UPDATE pedidos SET status = :status WHERE id = :id");
                    $stmt->execute([':id' => $id, ':status' => $status]);
                    $msg = 'Status do pedido atualizado!';
                }
                break;

            // ---- Change Password ----
            case 'alterar_senha':
                $senha_atual = $_POST['senha_atual'] ?? '';
                $nova_senha = $_POST['nova_senha'] ?? '';
                $confirmar = $_POST['confirmar_senha'] ?? '';

                $stmt = $db->prepare("SELECT * FROM admin WHERE usuario = :user");
                $stmt->execute([':user' => ADMIN_USER]);
                $admin = $stmt->fetch();

                if (!$admin || !password_verify($senha_atual, $admin['senha_hash'])) {
                    throw new Exception('Senha atual incorreta.');
                }
                if ($nova_senha !== $confirmar) {
                    throw new Exception('As senhas não conferem.');
                }
                if (strlen($nova_senha) < 6) {
                    throw new Exception('A nova senha deve ter no mínimo 6 caracteres.');
                }

                $stmt = $db->prepare("UPDATE admin SET senha_hash = :hash WHERE id = :id");
                $stmt->execute([':hash' => password_hash($nova_senha, PASSWORD_DEFAULT), ':id' => $admin['id']]);
                $msg = 'Senha alterada com sucesso!';
                break;
        }
    } catch (Exception $é) {
        $msg = 'Erro: ' . $é->getMessage();
    }
}

// ============================================================
// Helper: transliterate
// ============================================================
if (!function_exists('transliterate')) {
    function transliterate($string) {
        $table = [
            'á'=>'à','à'=>'à','ã'=>'à','â'=>'à','ä'=>'à',
            'é'=>'é','è'=>'é','ê'=>'é','ë'=>'é',
            'í'=>'i','ì'=>'i','î'=>'i','ï'=>'i',
            'ó'=>'o','ò'=>'o','õ'=>'o','ô'=>'o','ö'=>'o',
            'ú'=>'u','ù'=>'u','û'=>'u','ü'=>'u',
            'ç'=>'c','Ç'=>'C',
            'Á'=>'A','À'=>'A','Ã'=>'A','Â'=>'A','Ä'=>'A',
            'É'=>'E','È'=>'E','Ê'=>'E','Ë'=>'E',
            'Í'=>'I','Ì'=>'I','Î'=>'I','Ï'=>'I',
            'Ó'=>'O','Ò'=>'O','Õ'=>'O','Ô'=>'O','Ö'=>'O',
            'Ú'=>'U','Ù'=>'U','Û'=>'U','Ü'=>'U',
        ];
        return strtr($string, $table);
    }
}

// ============================================================
// Determine current page
// ============================================================
$page = isset($_GET['action']) ? $_GET['action'] : 'dashboard';
$editarId = isset($_GET['id']) ? (int)$_GET['id'] : 0;

// ============================================================
// HTML START
// ============================================================
?><!DOCTYPE html>
<html lang="pt-br" data-theme="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Admin - Chefão Autopeças</title>
<link rel="stylesheet" href="../css/style.css">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<style>
    :root { --sidebar-width: 240px; }
    .admin-body { display: flex; min-height: 100vh; padding-top: 0; }
    .sidebar {
        width: var(--sidebar-width);
        background: var(--bg-secondary);
        border-right: 1px solid var(--border-color);
        padding: 24px 0;
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        overflow-y: auto;
        z-index: 100;
    }
    .sidebar .logo { padding: 0 20px 24px; border-bottom: 1px solid var(--border-color); margin-bottom: 16px; }
    .sidebar .logo à { font-size: 1.1rem; }
    .sidebar nav à {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 20px;
        color: var(--text-secondary);
        transition: var(--transition);
        font-size: 0.9rem;
    }
    .sidebar nav à:hover, .sidebar nav à.active { background: rgba(255,111,0,0.08); color: var(--primary); }
    .sidebar nav à i { width: 20px; text-align: center; }
    .main-content { margin-left: var(--sidebar-width); flex: 1; padding: 24px 32px; min-height: 100vh; }
    .admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; flex-wrap: wrap; gap: 16px; }
    .admin-header h1 { font-size: 1.5rem; font-weight: 700; }
    .admin-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px,1fr)); gap: 20px; margin-bottom: 32px; }
    .admin-card { background: var(--bg-card); border-radius: var(--border-radius); padding: 24px; border: 1px solid var(--border-color); }
    .admin-card .num { font-size: 2rem; font-weight: 800; color: var(--primary); }
    .admin-card .label { color: var(--text-muted); font-size: 0.85rem; }
    .admin-table { width: 100%; border-collapse: collapse; background: var(--bg-card); border-radius: var(--border-radius); overflow: hidden; }
    .admin-table th, .admin-table td { padding: 12px 16px; text-align: left; border-bottom: 1px solid var(--border-color); font-size: 0.9rem; }
    .admin-table th { background: var(--bg-elevated); color: var(--text-muted); font-weight: 600; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; }
    .admin-table tr:hover { background: rgba(255,255,255,0.02); }
    .admin-form { background: var(--bg-card); border-radius: var(--border-radius); padding: 32px; border: 1px solid var(--border-color); max-width: 700px; }
    .admin-form .form-group { margin-bottom: 16px; }
    .admin-form .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .admin-form input, .admin-form select, .admin-form textarea { width: 100%; }
    .admin-form textarea { min-height: 100px; }
    .admin-form .btn { margin-top: 8px; }
    .checkbox-group { display: flex; gap: 20px; align-items: center; }
    .checkbox-group label { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 0.9rem; }
    .checkbox-group input[type="checkbox"] { width: auto !important; }
    .msg { padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 0.9rem; }
    .msg.success { background: rgba(0,230,118,0.1); color: #00E676; border: 1px solid rgba(0,230,118,0.2); }
    .msg.error { background: rgba(255,82,82,0.1); color: #FF5252; border: 1px solid rgba(255,82,82,0.2); }
    .login-page { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: var(--bg-primary); }
    .login-box { background: var(--bg-card); border-radius: var(--border-radius-lg); padding: 48px; border: 1px solid var(--border-color); max-width: 400px; width: 100%; }
    .login-box h1 { text-align: center; margin-bottom: 8px; font-size: 1.5rem; }
    .login-box p { text-align: center; color: var(--text-muted); margin-bottom: 24px; font-size: 0.9rem; }
    .login-box .form-group { margin-bottom: 16px; }
    .login-box .btn { width: 100%; justify-content: center; }
    .action-btns { display: flex; gap: 8px; }
    .action-btns .btn { padding: 8px 14px; font-size: 0.8rem; }
    .tag-status { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
    .tag-novo { background: rgba(0,229,255,0.1); color: #00E5FF; }
    .tag-em_andamento { background: rgba(255,193,7,0.1); color: #FFC107; }
    .tag-finalizado { background: rgba(0,230,118,0.1); color: #00E676; }
    .tag-cancelado { background: rgba(255,82,82,0.1); color: #FF5252; }
    @media (max-width: 768px) {
        .sidebar { display: none; }
        .main-content { margin-left: 0; padding: 16px; }
        .admin-form .form-row { grid-template-columns: 1fr; }
    }
    .admin-table td.ações { white-space: nowrap; }
    .btn-danger { background: linear-gradient(135deg, #FF5252, #D32F2F); color: white; }
    .btn-danger:hover { box-shadow: 0 4px 20px rgba(255,82,82,0.3); }
</style>
<script>(function(){var t=localStorage.getItem('chefao-theme')||'dark';document.documentElement.setAttribute('data-theme',t);})();</script>
</head>
<body>
<?php if ($page === 'login' || !isLoggedIn()): ?>
<!-- ============================================================ LOGIN PAGE ============================================================ -->
<div class="login-page">
    <div class="login-box reveal visible">
        <div style="text-align:center;font-size:3rem;color:var(--primary);margin-bottom:16px;"><i class="fas fa-car"></i></div>
        <h1>Chefão Autopeças</h1>
        <p>Painel Administrativo</p>
        <?php if (isset($_GET['erro'])): ?>
            <div class="msg error"><?= htmlspecialchars($_GET['erro']) ?></div>
        <?php endif; ?>
        <form method="post" action="auth.php">
            <input type="hidden" name="action" value="login">
            <div class="form-group">
                <label for="usuario">Usuário</label>
                <input type="text" id="usuario" name="usuario" placeholder="admin" required>
            </div>
            <div class="form-group">
                <label for="senha">Senha</label>
                <input type="password" id="senha" name="senha" placeholder="••••••" required>
            </div>
            <button type="submit" class="btn btn-primary"><i class="fas fa-sign-in-alt"></i> Entrar</button>
        </form>
        <div style="text-align:center;margin-top:16px;"><à href="../index.html" style="color:var(--text-muted);font-size:0.85rem;"><i class="fas fa-arrow-left"></i> Voltar ao site</à></div>
    </div>
</div>
<?php else: ?>
<!-- ============================================================ ADMIN PANEL ============================================================ -->
<div class="admin-body">
    <aside class="sidebar">
        <div class="logo">
            <à href="admin-painel.php"><span class="logo-icon"><i class="fas fa-car" style="color:var(--primary);"></i></span> Chefão</à>
        </div>
        <nav>
            <à href="admin-painel.php?action=dashboard" class="<?= $page === 'dashboard' ? 'active' : '' ?>"><i class="fas fa-chart-simple"></i> Dashboard</à>
            <à href="admin-painel.php?action=produtos" class="<?= $page === 'produtos' || $page === 'editar_produto' || $page === 'novo_produto' ? 'active' : '' ?>"><i class="fas fa-box"></i> Produtos</à>
            <à href="admin-painel.php?action=categorias" class="<?= $page === 'categorias' ? 'active' : '' ?>"><i class="fas fa-tags"></i> Categorias</à>
            <à href="admin-painel.php?action=pedidos" class="<?= $page === 'pedidos' ? 'active' : '' ?>"><i class="fas fa-clipboard-list"></i> Pedidos</à>
            <à href="admin-painel.php?action=senha" class="<?= $page === 'senha' ? 'active' : '' ?>"><i class="fas fa-key"></i> Alterar Senha</à>
            <hr style="border-color:var(--border-color);margin:16px 20px;">
            <à href="auth.php?action=logout" style="color:var(--danger);"><i class="fas fa-sign-out-alt"></i> Sair</à>
        </nav>
    </aside>

    <main class="main-content">
        <?php if ($msg): ?>
            <div class="msg success"><?= htmlspecialchars($msg) ?></div>
        <?php endif; ?>

        <!-- ============================================================ DASHBOARD ============================================================ -->
        <?php if ($page === 'dashboard'): ?>
            <?php 
                $stats = $db->query("SELECT COUNT(*) as total FROM produtos WHERE ativo=1")->fetch();
                $catCount = $db->query("SELECT COUNT(*) as total FROM categorias")->fetch();
                $pedCount = $db->query("SELECT COUNT(*) as total FROM pedidos")->fetch();
                $novos = $db->query("SELECT COUNT(*) as total FROM pedidos WHERE status='novo'")->fetch();
            ?>
            <div class="admin-header"><h1><i class="fas fa-chart-simple"></i> Dashboard</h1></div>
            <div class="admin-grid">
                <div class="admin-card"><div class="num"><?= $stats['total'] ?></div><div class="label">Produtos Ativos</div></div>
                <div class="admin-card"><div class="num"><?= $catCount['total'] ?></div><div class="label">Categorias</div></div>
                <div class="admin-card"><div class="num"><?= $pedCount['total'] ?></div><div class="label">Pedidos</div></div>
                <div class="admin-card"><div class="num" style="color:var(--warning)"><?= $novos['total'] ?></div><div class="label">Pedidos Novos</div></div>
            </div>
            <div style="background:var(--bg-card);border-radius:var(--border-radius);padding:24px;border:1px solid var(--border-color);">
                <h3 style="margin-bottom:16px;"><i class="fas fa-clock"></i> Últimos Pedidos</h3>
                <?php $pedidos = $db->query("SELECT * FROM pedidos ORDER BY data_criacao DESC LIMIT 5")->fetchAll(); ?>
                <?php if (count($pedidos) > 0): ?>
                    <table class="admin-table">
                        <tr><th>ID</th><th>Cliente</th><th>Total</th><th>Status</th><th>Data</th></tr>
                        <?php foreach ($pedidos as $p): ?>
                        <tr>
                            <td>#<?= $p['id'] ?></td>
                            <td><?= htmlspecialchars($p['cliente_nome'] ?: '-') ?></td>
                            <td>R$ <?= number_format($p['total'], 2, ',', '.') ?></td>
                            <td><span class="tag-status tag-<?= $p['status'] ?>"><?= $p['status'] ?></span></td>
                            <td><?= date('d/m/Y H:i', strtotime($p['data_criacao'])) ?></td>
                        </tr>
                        <?php endforeach; ?>
                    </table>
                <?php else: ?>
                    <p style="color:var(--text-muted);text-align:center;padding:20px;">Nenhum pedido ainda.</p>
                <?php endif; ?>
            </div>

        <!-- ============================================================ PRODUTOS ============================================================ -->
        <?php elseif ($page === 'produtos'): ?>
            <div class="admin-header">
                <h1><i class="fas fa-box"></i> Produtos</h1>
                <à href="admin-painel.php?action=novo_produto" class="btn btn-primary btn-sm"><i class="fas fa-plus"></i> Novo Produto</à>
            </div>
            <?php $produtos = $db->query("SELECT p.*, c.nome as cat_nome FROM produtos p LEFT JOIN categorias c ON p.categoria_id = c.id ORDER BY p.data_cadastro DESC")->fetchAll(); ?>
            <?php if (count($produtos) > 0): ?>
                <div style="overflow-x:auto;">
                    <table class="admin-table">
                        <tr><th>Código</th><th>Nome</th><th>Categoria</th><th>Preço</th><th>Estoque</th><th>Destaque</th><th>Ações</th></tr>
                        <?php foreach ($produtos as $p): ?>
                        <tr>
                            <td><?= htmlspecialchars($p['código'] ?: '-') ?></td>
                            <td><strong><?= htmlspecialchars($p['nome']) ?></strong></td>
                            <td><?= htmlspecialchars($p['cat_nome'] ?: '-') ?></td>
                            <td>R$ <?= number_format($p['preco_promocional'] ?: $p['preco'], 2, ',', '.') ?></td>
                            <td><?= $p['estoque'] ?></td>
                            <td><?= $p['destaque'] ? '<i class="fas fa-star" style="color:var(--warning)"></i>' : '-' ?></td>
                            <td class="ações">
                                <div class="action-btns">
                                    <à href="admin-painel.php?action=editar_produto&id=<?= $p['id'] ?>" class="btn btn-outline btn-sm"><i class="fas fa-edit"></i></à>
                                    <form method="post" onsubmit="return confirm('Excluir produto?')" style="display:inline;">
                                        <input type="hidden" name="action" value="excluir_produto">
                                        <input type="hidden" name="id" value="<?= $p['id'] ?>">
                                        <button type="submit" class="btn btn-danger btn-sm"><i class="fas fa-trash-alt"></i></button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </table>
                </div>
            <?php else: ?>
                <div style="text-align:center;padding:40px;color:var(--text-muted);">
                    <i class="fas fa-box-open" style="font-size:3rem;margin-bottom:16px;display:block;opacity:0.3;"></i>
                    <p>Nenhum produto cadastrado.</p>
                    <à href="admin-painel.php?action=novo_produto" class="btn btn-primary" style="margin-top:16px;"><i class="fas fa-plus"></i> Cadastrar Produto</à>
                </div>
            <?php endif; ?>

        <!-- ============================================================ NOVO / EDITAR PRODUTO ============================================================ -->
        <?php elseif ($page === 'novo_produto' || $page === 'editar_produto'): ?>
            <?php 
                $prod = null;
                if ($editarId > 0) {
                    $stmt = $db->prepare("SELECT * FROM produtos WHERE id = :id");
                    $stmt->execute([':id' => $editarId]);
                    $prod = $stmt->fetch();
                }
                $categorias = $db->query("SELECT * FROM categorias ORDER BY ordem ASC")->fetchAll();
            ?>
            <div class="admin-header">
                <h1><i class="fas fa-<?= $prod ? 'edit' : 'plus' ?>"></i> <?= $prod ? 'Editar' : 'Novo' ?> Produto</h1>
                <à href="admin-painel.php?action=produtos" class="btn btn-secondary btn-sm"><i class="fas fa-arrow-left"></i> Voltar</à>
            </div>
            <form method="post" class="admin-form">
                <input type="hidden" name="action" value="salvar_produto">
                <?php if ($prod): ?><input type="hidden" name="id" value="<?= $prod['id'] ?>"><?php endif; ?>
                <div class="form-row">
                    <div class="form-group">
                        <label>Nome *</label>
                        <input type="text" name="nome" value="<?= htmlspecialchars($prod['nome'] ?? '') ?>" required>
                    </div>
                    <div class="form-group">
                        <label>Slug (URL)</label>
                        <input type="text" name="slug" value="<?= htmlspecialchars($prod['slug'] ?? '') ?>" placeholder="gerado automaticamente">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Código da Peça</label>
                        <input type="text" name="código" value="<?= htmlspecialchars($prod['código'] ?? '') ?>" placeholder="ex: KT-1001">
                    </div>
                    <div class="form-group">
                        <label>Categoria</label>
                        <select name="categoria_id">
                            <option value="">Sem categoria</option>
                            <?php foreach ($categorias as $cat): ?>
                                <option value="<?= $cat['id'] ?>" <?= ($prod && $prod['categoria_id'] == $cat['id']) ? 'selected' : '' ?>><?= htmlspecialchars($cat['nome']) ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Descrição</label>
                    <textarea name="descrição"><?= htmlspecialchars($prod['descrição'] ?? '') ?></textarea>
                </div>
                <div class="form-group">
                    <label>Especificações (formato JSON)</label>
                    <textarea name="especificações" style="font-family:monospace;font-size:0.8rem;" placeholder='{"Aplicação":"Gol 1.0","Material":"Borracha"} '><?= htmlspecialchars($prod['especificações'] ?? '') ?></textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Preço (R$) *</label>
                        <input type="number" step="0.01" name="preco" value="<?= $prod['preco'] ?? '0' ?>" required>
                    </div>
                    <div class="form-group">
                        <label>Preço Promocional (R$)</label>
                        <input type="number" step="0.01" name="preco_promocional" value="<?= $prod['preco_promocional'] ?? '' ?>" placeholder="deixar vazio se não houver">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Ícone (FontAwesome)</label>
                        <input type="text" name="icone" value="<?= htmlspecialchars($prod['icone'] ?? 'fas fa-car') ?>" placeholder="fas fa-car">
                    </div>
                    <div class="form-group">
                        <label>Estoque</label>
                        <input type="number" name="estoque" value="<?= $prod['estoque'] ?? '0' ?>">
                    </div>
                </div>
                <div class="checkbox-group">
                    <label><input type="checkbox" name="destaque" <?= ($prod && $prod['destaque']) ? 'checked' : '' ?>> <i class="fas fa-star" style="color:var(--warning)"></i> Destaque</label>
                    <label><input type="checkbox" name="ativo" <?= (!$prod || $prod['ativo']) ? 'checked' : '' ?>> <i class="fas fa-check-circle" style="color:var(--success)"></i> Ativo</label>
                </div>
                <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Salvar Produto</button>
            </form>

        <!-- ============================================================ CATEGORIAS ============================================================ -->
        <?php elseif ($page === 'categorias'): ?>
            <div class="admin-header">
                <h1><i class="fas fa-tags"></i> Categorias</h1>
            </div>
            <?php $categorias = $db->query("SELECT c.*, (SELECT COUNT(*) FROM produtos p WHERE p.categoria_id = c.id) as total FROM categorias c ORDER BY c.ordem ASC")->fetchAll(); ?>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:32px;">
                <div>
                    <h3 style="margin-bottom:16px;">Categorias Existentes</h3>
                    <?php if (count($categorias) > 0): ?>
                        <table class="admin-table">
                            <tr><th>Nome</th><th>Ícone</th><th>Produtos</th><th>Ações</th></tr>
                            <?php foreach ($categorias as $cat): ?>
                            <tr>
                                <td><strong><?= htmlspecialchars($cat['nome']) ?></strong></td>
                                <td><i class="<?= htmlspecialchars($cat['icone'] ?: 'fas fa-car') ?>"></i></td>
                                <td><?= $cat['total'] ?></td>
                                <td class="ações">
                                    <div class="action-btns">
                                        <à href="admin-painel.php?action=editar_produto&cat_id=<?= $cat['id'] ?>" class="btn btn-outline btn-sm"><i class="fas fa-eye"></i></à>
                                        <form method="post" onsubmit="return confirm('Excluir categoria? Os produtos ficarão sem categoria.')" style="display:inline;">
                                            <input type="hidden" name="action" value="excluir_categoria">
                                            <input type="hidden" name="id" value="<?= $cat['id'] ?>">
                                            <button type="submit" class="btn btn-danger btn-sm"><i class="fas fa-trash-alt"></i></button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        </table>
                    <?php else: ?>
                        <p style="color:var(--text-muted);">Nenhuma categoria cadastrada.</p>
                    <?php endif; ?>
                </div>
                <div>
                    <h3 style="margin-bottom:16px;">Nova Categoria</h3>
                    <form method="post" class="admin-form" style="padding:24px;">
                        <input type="hidden" name="action" value="salvar_categoria">
                        <div class="form-group">
                            <label>Nome *</label>
                            <input type="text" name="nome" required>
                        </div>
                        <div class="form-group">
                            <label>Slug (URL)</label>
                            <input type="text" name="slug" placeholder="gerado automaticamente">
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Ícone (FontAwesome)</label>
                                <input type="text" name="icone" value="fas fa-car">
                            </div>
                            <div class="form-group">
                                <label>Ordem</label>
                                <input type="number" name="ordem" value="<?= count($categorias) + 1 ?>">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Descrição</label>
                            <textarea name="descrição"></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Criar Categoria</button>
                    </form>
                </div>
            </div>

        <!-- ============================================================ PEDIDOS ============================================================ -->
        <?php elseif ($page === 'pedidos'): ?>
            <div class="admin-header">
                <h1><i class="fas fa-clipboard-list"></i> Pedidos</h1>
            </div>
            <?php $pedidos = $db->query("SELECT * FROM pedidos ORDER BY data_criacao DESC")->fetchAll(); ?>
            <?php if (count($pedidos) > 0): ?>
                <div style="overflow-x:auto;">
                    <table class="admin-table">
                        <tr>
                            <th>#</th><th>Cliente</th><th>Telefone</th><th>Itens</th><th>Total</th>
                            <th>Status</th><th>Data</th><th>Ações</th>
                        </tr>
                        <?php foreach ($pedidos as $p): ?>
                        <tr>
                            <td>#<?= $p['id'] ?></td>
                            <td><?= htmlspecialchars($p['cliente_nome'] ?: '-') ?></td>
                            <td><?= htmlspecialchars($p['cliente_telefone'] ?: '-') ?></td>
                            <td><?= htmlspecialchars($p['itens'] ? substr($p['itens'], 0, 50) . '...' : '-') ?></td>
                            <td>R$ <?= number_format($p['total'], 2, ',', '.') ?></td>
                            <td><span class="tag-status tag-<?= $p['status'] ?>"><?= $p['status'] ?></span></td>
                            <td><?= date('d/m/Y', strtotime($p['data_criacao'])) ?></td>
                            <td class="ações">
                                <form method="post" style="display:flex;gap:4px;align-items:center;">
                                    <input type="hidden" name="action" value="atualizar_pedido">
                                    <input type="hidden" name="id" value="<?= $p['id'] ?>">
                                    <select name="status" style="padding:4px 8px;border-radius:6px;border:1px solid var(--border-color);background:var(--bg-input);color:var(--text-primary);font-size:0.8rem;">
                                        <option value="novo" <?= $p['status'] === 'novo' ? 'selected' : '' ?>>Novo</option>
                                        <option value="em_andamento" <?= $p['status'] === 'em_andamento' ? 'selected' : '' ?>>Em Andamento</option>
                                        <option value="finalizado" <?= $p['status'] === 'finalizado' ? 'selected' : '' ?>>Finalizado</option>
                                        <option value="cancelado" <?= $p['status'] === 'cancelado' ? 'selected' : '' ?>>Cancelado</option>
                                    </select>
                                    <button type="submit" class="btn btn-outline btn-sm"><i class="fas fa-check"></i></button>
                                </form>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </table>
                </div>
            <?php else: ?>
                <div style="text-align:center;padding:40px;color:var(--text-muted);">
                    <i class="fas fa-inbox" style="font-size:3rem;margin-bottom:16px;display:block;opacity:0.3;"></i>
                    <p>Nenhum pedido recebido ainda.</p>
                </div>
            <?php endif; ?>

        <!-- ============================================================ ALTERAR SENHA ============================================================ -->
        <?php elseif ($page === 'senha'): ?>
            <div class="admin-header">
                <h1><i class="fas fa-key"></i> Alterar Senha</h1>
            </div>
            <form method="post" class="admin-form">
                <input type="hidden" name="action" value="alterar_senha">
                <div class="form-group">
                    <label>Senha Atual *</label>
                    <input type="password" name="senha_atual" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Nova Senha *</label>
                        <input type="password" name="nova_senha" required minlength="6">
                    </div>
                    <div class="form-group">
                        <label>Confirmar Nova Senha *</label>
                        <input type="password" name="confirmar_senha" required minlength="6">
                    </div>
                </div>
                <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Alterar Senha</button>
            </form>
        <?php endif; ?>
    </main>
</div>
<?php endif; ?>
<script src="../js/main.js"></script>
</body>
</html>
