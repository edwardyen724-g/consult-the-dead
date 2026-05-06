Set-Location "C:\projects\consult-the-dead"

# Move portraits to correct location (website/public/portraits/)
if (Test-Path "public\portraits") {
    New-Item -ItemType Directory -Path "website\public\portraits" -Force | Out-Null
    Move-Item "public\portraits\*" -Destination "website\public\portraits\" -Force
    Remove-Item "public\portraits" -Force
    Remove-Item "public" -Force -ErrorAction SilentlyContinue
    Write-Host "Moved portraits to website/public/portraits/"
}

# Move data/frameworks to website/data/frameworks
if (Test-Path "data\frameworks") {
    New-Item -ItemType Directory -Path "website\data\frameworks" -Force | Out-Null
    Copy-Item "data\frameworks\*" -Destination "website\data\frameworks\" -Recurse -Force
    Remove-Item "data" -Recurse -Force
    Write-Host "Moved frameworks data to website/data/frameworks/"
}

# Copy source code changes to correct paths
Copy-Item "C:\projects\greatminds\website\src\components\MindCard.tsx" -Destination "website\src\components\MindCard.tsx" -Force
Copy-Item "C:\projects\greatminds\website\src\app\page.tsx" -Destination "website\src\app\page.tsx" -Force
Copy-Item "C:\projects\greatminds\website\src\app\agora\AgoraApp.tsx" -Destination "website\src\app\agora\AgoraApp.tsx" -Force
Copy-Item "C:\projects\greatminds\website\src\lib\packs.ts" -Destination "website\src\lib\packs.ts" -Force
Copy-Item "C:\projects\greatminds\website\src\lib\frameworks.ts" -Destination "website\src\lib\frameworks.ts" -Force
Copy-Item "C:\projects\greatminds\website\src\app\globals.css" -Destination "website\src\app\globals.css" -Force
Copy-Item "C:\projects\greatminds\website\src\app\agora\page.tsx" -Destination "website\src\app\agora\page.tsx" -Force
Write-Host "Source files updated"

# Stage and commit
git add -A
git status --short | Select-Object -First 30
git commit -m "fix: move portraits/data to website/ subdir + sync pack UI source changes

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
git push origin master
Write-Host "`nFIXED AND PUSHED"
