$ErrorActionPreference = "Stop"

$ffmpegUrl = "https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip"
$installDir = "$env:USERPROFILE\ffmpeg"
$zipPath = "$env:TEMP\ffmpeg.zip"

Write-Host "Downloading FFmpeg from $ffmpegUrl..."
Invoke-WebRequest -Uri $ffmpegUrl -OutFile $zipPath

Write-Host "Extracting to $installDir..."
# Force create directory
if (Test-Path $installDir) { Remove-Item -Path $installDir -Recurse -Force }
New-Item -ItemType Directory -Force -Path $installDir | Out-Null

# Extract
Expand-Archive -Path $zipPath -DestinationPath $env:TEMP\ffmpeg_extracted -Force

# Move the inner folder content to installDir
$extractedRoot = Get-ChildItem -Path "$env:TEMP\ffmpeg_extracted" | Select-Object -First 1
Move-Item -Path "$extractedRoot\bin" -Destination "$installDir\bin"

# Cleanup
Remove-Item $zipPath -Force
Remove-Item "$env:TEMP\ffmpeg_extracted" -Recurse -Force

# Add to PATH
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($currentPath -notlike "*$installDir\bin*") {
    $newPath = "$currentPath;$installDir\bin"
    [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
    Write-Host "Added FFmpeg to User PATH."
} else {
    Write-Host "FFmpeg is already in PATH."
}

Write-Host "FFmpeg installed successfully!"
Write-Host "IMPORTANT: You must restart your terminal and the Flask server for changes to take effect."
