$ErrorActionPreference = "Continue"
python -m pip install playwright 2>&1 | Out-File -Append pip.log
python -m playwright install chromium 2>&1 | Out-File -Append pip.log
python screenshot.py 2>&1 | Out-File -Append shot3.log
Write-Host "DONE" | Out-File -Append shot3.log
