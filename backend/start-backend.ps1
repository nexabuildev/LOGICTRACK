# Inicia solo el backend de LogicTrack (requiere PostgreSQL en Docker)
$ErrorActionPreference = "Stop"

Write-Host "=== LogicTrack Backend ===" -ForegroundColor Cyan

# 1. Comprobar PostgreSQL
$pg = docker ps --filter "name=logictrack-postgres" --format "{{.Names}}" 2>$null
if (-not $pg) {
    Write-Host "PostgreSQL no esta corriendo. Iniciando contenedor..." -ForegroundColor Yellow
    docker start logictrack-postgres 2>$null
    if (-not $?) {
        Write-Host "ERROR: Levanta primero la base de datos:" -ForegroundColor Red
        Write-Host "  cd .." 
        Write-Host "  docker compose up -d postgres-db mailhog-email"
        exit 1
    }
    Start-Sleep -Seconds 3
}
Write-Host "PostgreSQL OK" -ForegroundColor Green

# 2. Liberar puerto 8080 si hay un Java colgado
$port8080 = netstat -ano | Select-String ":8080.*LISTENING"
if ($port8080) {
    $pid = ($port8080 -split '\s+')[-1]
    $proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
    if ($proc -and $proc.ProcessName -eq "java") {
        Write-Host "Puerto 8080 ocupado por Java (PID $pid). Deteniendo instancia anterior..." -ForegroundColor Yellow
        Stop-Process -Id $pid -Force
        Start-Sleep -Seconds 2
    } else {
        Write-Host "ERROR: Puerto 8080 ocupado por otro proceso (PID $pid)." -ForegroundColor Red
        exit 1
    }
}

# 3. Arrancar Spring Boot
Write-Host "Iniciando backend en http://localhost:8080 ..." -ForegroundColor Cyan
Set-Location $PSScriptRoot
.\mvnw.cmd spring-boot:run
