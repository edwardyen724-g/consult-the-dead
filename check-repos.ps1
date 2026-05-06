Set-Location "C:\projects"
Write-Host "Projects directory listing:"
Get-ChildItem -Directory | ForEach-Object { Write-Host $_.Name }
Write-Host "---"
if (Test-Path "consult-the-dead") {
    Write-Host "consult-the-dead EXISTS"
    Set-Location "consult-the-dead"
    git remote -v
    git log --oneline -3
} else {
    Write-Host "consult-the-dead NOT FOUND locally"
    Write-Host "Cloning..."
    git clone https://github.com/edwardyen724-g/consult-the-dead.git
    Set-Location "consult-the-dead"
    git log --oneline -3
}
