# 局域网演示服务器（给领导/评审看的那一次）
# 用法：右键“使用 PowerShell 运行”，或在 PowerShell 里执行  .\start-demo.ps1
# 说明：先确保已经构建过（dist/ 存在）；改过代码要重新构建。

$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $here

$node = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $node) {
  foreach ($c in @("$env:ProgramFiles\nodejs\node.exe", "${env:ProgramFiles(x86)}\nodejs\node.exe")) {
    if (Test-Path $c) { $node = $c; break }
  }
}
if (-not (Test-Path $node)) {
  $node = (Get-Command node -ErrorAction SilentlyContinue).Source
}
if (-not $node) { Write-Host '找不到 node.exe，请先安装 Node 或在脚本里改成实际路径' -ForegroundColor Red; pause; exit 1 }
if (-not (Test-Path '.\dist\index.html')) {
  Write-Host '没有 dist/，先构建：' -ForegroundColor Yellow
  Write-Host "  & '$node' node_modules\vite\bin\vite.js build"
  pause; exit 1
}

# 关掉占用 4173 的旧进程
$old = Get-NetTCPConnection -LocalPort 4173 -State Listen -ErrorAction SilentlyContinue
if ($old) { $old | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue } }

Write-Host ''
Write-Host '  新能源荷储实证平台 · 局域网演示' -ForegroundColor Cyan
Write-Host '  ---------------------------------'
Get-NetIPAddress -AddressFamily IPv4 |
  Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' -and $_.IPAddress -notlike '192.168.*' } |
  ForEach-Object { Write-Host ("  同事访问： http://{0}:4173/" -f $_.IPAddress) -ForegroundColor Green }
Write-Host ''
Write-Host '  本机访问： http://127.0.0.1:4173/'
Write-Host '  按 Ctrl+C 结束演示'
Write-Host ''

& $node 'node_modules\vite\bin\vite.js' preview --port 4173 --strictPort --host 0.0.0.0
