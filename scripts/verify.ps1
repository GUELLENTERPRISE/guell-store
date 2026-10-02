$ErrorActionPreference = 'Stop'

npm ci --ignore-scripts *> ci.log
if ($LASTEXITCODE -ne 0) { Write-Error 'npm ci failed'; exit 1 }

npm run lint *> lint.log
if ($LASTEXITCODE -ne 0) { Write-Error 'lint failed'; exit 1 }

npm run build *> build.log
if ($LASTEXITCODE -ne 0) { Write-Error 'build failed'; exit 1 }

Write-Output 'VERIFY_OK'
Write-Output 'Detailed logs: ci.log, lint.log, build.log'
