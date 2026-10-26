# 本机演示服务器（只在你自己的电脑上可访问）
# 用法：右键“使用 PowerShell 运行”，或  .\start-local.ps1
# 打开：http://127.0.0.1:4173/
# 说明：改过代码要先重新构建：  .\build-local.ps1  或手动跑 vite build

$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $here

$node = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $node) {
  foreach ($c in @("$env:ProgramFiles\nodejs\node.exe", "${env:ProgramFiles(x86)}\nodejs\node.exe")) {
    if (Test-Path $c) { $node = $c; break }
  }
}
if (-not (Test-Path $node)) { $node = (Get-Command node -ErrorAction SilentlyContinue).Source }
if (-not $node) { Write-Host '找不到 node.exe' -ForegroundColor Red; pause; exit 1 }

if (-not (Test-Path '.\dist\index.html')) {
  Write-Host '没有 dist/，先构建：' -ForegroundColor Yellow
  Write-Host "  & '$node' node_modules\vite\bin\vite.js build"
  pause; exit 1
}

$old = Get-NetTCPConnection -LocalPort 4173 -State Listen -ErrorAction SilentlyContinue
if ($old) { $old | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue } }

Write-Host ''
Write-Host '  新能源荷储实证平台 · 本机演示' -ForegroundColor Cyan
Write-Host '  --------------------------------'
Write-Host '  打开：http://127.0.0.1:4173/' -ForegroundColor Green
Write-Host '  （只在本机可访问，局域网其他电脑连不上）'
Write-Host '  按 Ctrl+C 结束'
Write-Host ''

& $node 'node_modules\vite\bin\vite.js' preview --port 4173 --strictPort --host 127.0.0.1
