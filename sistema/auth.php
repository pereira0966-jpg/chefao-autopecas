<?php
/* ============================================================
   CHEFÃO AUTOPEÇAS - Admin Authentication
   ============================================================ */
session_start();

require_once __DIR__ . '/config.php';

// ============================================================
// Login
// ============================================================
function login($usuario, $senha) {
    $db = getDB();
    if (!$db) return false;

    $stmt = $db->prepare("SELECT * FROM admin WHERE usuario = :usuario");
    $stmt->execute([':usuario' => $usuario]);
    $admin = $stmt->fetch();

    if ($admin && password_verify($senha, $admin['senha_hash'])) {
        $_SESSION['admin_logado'] = true;
        $_SESSION['admin_usuario'] = $admin['usuario'];
        // Update hash if needed
        if (password_needs_rehash($admin['senha_hash'], PASSWORD_DEFAULT)) {
            $stmt = $db->prepare("UPDATE admin SET senha_hash = :hash WHERE id = :id");
            $stmt->execute([':hash' => password_hash($senha, PASSWORD_DEFAULT), ':id' => $admin['id']]);
        }
        return true;
    }
    return false;
}

// ============================================================
// Logout
// ============================================================
function logout() {
    $_SESSION = [];
    session_destroy();
}

// ============================================================
// Check if logged in
// ============================================================
function isLoggedIn() {
    return isset($_SESSION['admin_logado']) && $_SESSION['admin_logado'] === true;
}

// ============================================================
// Require authentication - redirect if not logged in
// ============================================================
function requireAuth() {
    if (!isLoggedIn()) {
        header('Location: admin-painel.php?action=login');
        exit;
    }
}

// ============================================================
// Handle login form submission
// ============================================================
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'login') {
    $usuario = isset($_POST['usuario']) ? trim($_POST['usuario']) : '';
    $senha = isset($_POST['senha']) ? $_POST['senha'] : '';

    if (login($usuario, $senha)) {
        header('Location: admin-painel.php');
        exit;
    } else {
        $erro = 'Usuário ou senha inválidos.';
        header('Location: admin-painel.php?action=login&erro=' . urlencode($erro));
        exit;
    }
}

// ============================================================
// Handle logout
// ============================================================
if (isset($_GET['action']) && $_GET['action'] === 'logout') {
    logout();
    header('Location: admin-painel.php?action=login');
    exit;
}
