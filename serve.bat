@echo off
echo.
echo =============================================
echo   Chefao Autopecas - Servidor Local
echo =============================================
echo.
echo Aguarde 3 segundos enquanto o servidor inicia...
start /min "" python -m http.server 8080
ping -n 4 127.0.0.1 >nul
start http://localhost:8080
echo Servidor rodando em http://localhost:8080
echo Feche a janela minimizada do Python para parar.
pause >nul
