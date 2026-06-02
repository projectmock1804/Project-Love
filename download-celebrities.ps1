# Download diverse celebrity images from Unsplash
$baseDir = "C:\Users\Administrator\Project Love\kin\public\images\celebrities"

# Female search terms (16 diverse faces/styles)
$femaleSearches = @(
    "woman portrait",
    "woman asian face",
    "woman strong look",
    "woman elegant style",
    "woman long hair",
    "woman short hair",
    "woman curly hair",
    "woman glasses",
    "woman smile",
    "woman professional",
    "woman young",
    "woman mature",
    "woman creative",
    "woman natural",
    "woman glamour",
    "woman confident"
)

# Male search terms (16 diverse faces/styles)
$maleSearches = @(
    "man portrait",
    "man asian",
    "man strong jaw",
    "man gentle face",
    "man long hair",
    "man beard",
    "man artistic",
    "man glasses",
    "man smile",
    "man business",
    "man young",
    "man mature",
    "man casual",
    "man outdoor",
    "man fashionable",
    "man confident"
)

$allSearches = @()
$counter = 1

foreach ($search in $femaleSearches) {
    $allSearches += @{ search = $search; filename = "female_$counter.jpg"; type = "female" }
    $counter++
}

$counter = 1
foreach ($search in $maleSearches) {
    $allSearches += @{ search = $search; filename = "male_$counter.jpg"; type = "male" }
    $counter++
}

Write-Host "Downloading 32 images from Unsplash..." -ForegroundColor Cyan

$downloaded = 0
foreach ($item in $allSearches) {
    $url = "https://source.unsplash.com/500x500/?$($item.search)"
    $filepath = Join-Path $baseDir $item.filename

    try {
        Invoke-WebRequest -Uri $url -OutFile $filepath -ErrorAction Stop
        $downloaded++
        Write-Host "OK: $($item.filename)" -ForegroundColor Green
        Start-Sleep -Milliseconds 300
    } catch {
        Write-Host "FAIL: $($item.filename)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Complete! $downloaded/32 images downloaded" -ForegroundColor Green
Write-Host "Location: $baseDir" -ForegroundColor Cyan
Get-ChildItem $baseDir | Measure-Object | ForEach-Object { "Files: $($_.Count)" }
