#!/usr/bin/env bash
set -euo pipefail
npm ci --ignore-scripts >ci.log 2>&1
npm run lint >lint.log 2>&1
npm run build >build.log 2>&1
echo 'VERIFY_OK'
echo 'Detailed logs: ci.log, lint.log, build.log'
