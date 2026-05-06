Set-Location "C:\projects\consult-the-dead"

# Check structure
Write-Host "Root files:"
Get-ChildItem -Name | Select-Object -First 20

# Create portraits dir and copy from greatminds
New-Item -ItemType Directory -Path "public\portraits" -Force | Out-Null
Copy-Item "C:\projects\greatminds\website\public\portraits\*.png" -Destination "public\portraits\" -Force

Write-Host "`nPortraits copied:"
Get-ChildItem "public\portraits" | ForEach-Object { Write-Host "  $($_.Name) ($([math]::Round($_.Length/1KB))KB)" }

# Copy updated source files from greatminds
Copy-Item "C:\projects\greatminds\website\src\components\MindCard.tsx" -Destination "src\components\MindCard.tsx" -Force
Copy-Item "C:\projects\greatminds\website\src\app\page.tsx" -Destination "src\app\page.tsx" -Force
Copy-Item "C:\projects\greatminds\website\src\app\agora\AgoraApp.tsx" -Destination "src\app\agora\AgoraApp.tsx" -Force

# Also need frameworks data and packs
if (-not (Test-Path "src\lib\packs.ts")) {
    Copy-Item "C:\projects\greatminds\website\src\lib\packs.ts" -Destination "src\lib\packs.ts" -Force
    Write-Host "Copied packs.ts"
}
Copy-Item "C:\projects\greatminds\website\src\lib\frameworks.ts" -Destination "src\lib\frameworks.ts" -Force

# Copy framework data files
if (-not (Test-Path "data\frameworks")) {
    New-Item -ItemType Directory -Path "data\frameworks" -Force | Out-Null
}
Copy-Item "C:\projects\greatminds\website\data\frameworks\*" -Destination "data\frameworks\" -Recurse -Force
Write-Host "`nFramework data synced"

# Stage, commit, push
git add -A
git status --short
git commit -m "feat(website): add AI-generated portraits for all 18 minds

Renaissance chiaroscuro style portraits generated via ChatGPT image model.
MindCard and PackMindCard now show portrait images with fallback to SVG initials.
Synced pack UI, framework data, and 10 new minds from greatminds repo.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
git push origin master
Write-Host "`nPUSHED to consult-the-dead - Vercel will auto-deploy"
