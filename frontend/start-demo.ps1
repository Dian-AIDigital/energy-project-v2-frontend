$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $here

Write-Host '正在检查并打包,请稍候...' -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host '打包失败，请修改代码后重试！' -ForegroundColor Red
    pause; exit 1
}
Write-Host '打包成功！' -ForegroundColor Green
# ======================================================

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

$old = Get-NetTCPConnection -LocalPort 4173 -State Listen -ErrorAction SilentlyContinue
if ($old) { $old | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue } }

Write-Host ''
Write-Host '  新能源荷储实证平台 · 局域网演示' -ForegroundColor Cyan
Write-Host '  ---------------------------------'
# 修复了屏蔽 192.168 网段的 Bug
Get-NetIPAddress -AddressFamily IPv4 |
  Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' -and $_.IPAddress -notlike '172.17.*' } |
  ForEach-Object { Write-Host ("  同事访问： http://{0}:4173/" -f $_.IPAddress) -ForegroundColor Green }
Write-Host ''
Write-Host '  本机访问： http://127.0.0.1:4173/'
Write-Host '  按 Ctrl+C 结束演示'
Write-Host ''

& $node 'node_modules\vite\bin\vite.js' preview --port 4173 --strictPort --host 0.0.0.0