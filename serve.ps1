$port = 8080
$root = Get-Location

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

Write-Host "Servidor rodando em http://localhost:$port"
Start-Process "http://localhost:$port"

$MIME = @{
    '.html' = 'text/html; charset=utf-8'
    '.css'  = 'text/css; charset=utf-8'
    '.js'   = 'application/javascript; charset=utf-8'
    '.json' = 'application/json; charset=utf-8'
    '.png'  = 'image/png'
    '.jpg'  = 'image/jpeg'
    '.jpeg' = 'image/jpeg'
    '.gif'  = 'image/gif'
    '.svg'  = 'image/svg+xml'
    '.ico'  = 'image/x-icon'
    '.woff' = 'font/woff'
    '.woff2'= 'font/woff2'
    '.yml'  = 'text/plain; charset=utf-8'
    '.md'   = 'text/markdown; charset=utf-8'
}

while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $req = $ctx.Request
    $res = $ctx.Response

    $path = $req.Url.AbsolutePath.TrimStart('/').Replace('/', '\')
    if ($path -eq '') { $path = 'index.html' }
    $fullPath = Join-Path $root $path

    try {
        if (Test-Path -LiteralPath $fullPath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($fullPath).ToLower()
            if ($MIME.ContainsKey($ext)) {
                $res.ContentType = $MIME[$ext]
            }
            $bytes = [System.IO.File]::ReadAllBytes($fullPath)
            $res.ContentLength64 = $bytes.Length
            $res.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $res.StatusCode = 404
            $msg = [Text.Encoding]::UTF8.GetBytes("404 - Nao encontrado")
            $res.OutputStream.Write($msg, 0, $msg.Length)
        }
    } catch {
        $res.StatusCode = 500
    }
    $res.Close()
}

$listener.Stop()
