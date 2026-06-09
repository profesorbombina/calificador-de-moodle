$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$node = Get-Command node -ErrorAction SilentlyContinue

if (-not $node) {
  throw "No se encontró Node.js. Ejecutá el generador con el runtime de Node disponible."
}

Push-Location $projectRoot
try {
  node tools/build-embeddable.js
}
finally {
  Pop-Location
}
