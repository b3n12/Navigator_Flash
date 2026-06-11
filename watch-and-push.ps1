# Auto watch-and-push script
# Watches the repository for filesystem changes, debounces events, commits and pushes changes.
$repo = 'Z:\\GIT\\WEBSITE\\Navigator_Flash'
Set-Location $repo
$branch = (git rev-parse --abbrev-ref HEAD).Trim()

$timer = New-Object System.Timers.Timer 5000
$timer.AutoReset = $false

# On timer elapsed, check git status and push if there are changes
Register-ObjectEvent -InputObject $timer -EventName Elapsed -Action {
    Set-Location $using:repo
    $status = git status --porcelain
    if (-not [string]::IsNullOrWhiteSpace($status)) {
        try {
            git add -A
            $msg = "Auto-commit: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
            git commit -m $msg
            git push origin $using:branch
            Write-Output "[watch-and-push] Pushed at $(Get-Date -Format o)"
        } catch {
            Write-Output "[watch-and-push] Push failed: $_"
        }
    } else {
        Write-Output "[watch-and-push] No changes to commit at $(Get-Date -Format o)"
    }
}

# Create a FileSystemWatcher to trigger the timer on any change
$fsw = New-Object System.IO.FileSystemWatcher $repo -Property @{ 
    IncludeSubdirectories = $true
    NotifyFilter = [IO.NotifyFilters]'FileName, LastWrite, DirectoryName'
    Filter = '*.*'
}

$action = {
    $t = $using:timer
    $t.Stop()
    $t.Start()
}

Register-ObjectEvent $fsw Changed -Action $action -SourceIdentifier FileChanged
Register-ObjectEvent $fsw Created -Action $action -SourceIdentifier FileCreated
Register-ObjectEvent $fsw Deleted -Action $action -SourceIdentifier FileDeleted
Register-ObjectEvent $fsw Renamed -Action $action -SourceIdentifier FileRenamed

$fsw.EnableRaisingEvents = $true
Write-Output "[watch-and-push] Watching $repo on branch $branch. Press Enter to exit."
[Console]::ReadLine() | Out-Null
