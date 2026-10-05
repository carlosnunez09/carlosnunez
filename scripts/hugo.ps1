param(
    [ValidateSet('setup', 'dev', 'preview', 'build')]
    [string]$Task = 'dev'
)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
Push-Location $projectRoot
try {
    $config = Get-Content 'netlify.toml' -Raw
    if ($config -notmatch 'HUGO_VERSION\s*=\s*"([^"]+)"') {
        throw 'HUGO_VERSION is missing from netlify.toml.'
    }
    $version = $Matches[1]
    $hugo = Join-Path $projectRoot '.tools/hugo/hugo.exe'
    $installed = if (Test-Path $hugo) { & $hugo version } else { '' }
    if ($installed -notmatch ('\bv' + [regex]::Escape($version) + '[-\s]')) {
        $toolDir = Join-Path $projectRoot '.tools/hugo'
        New-Item -ItemType Directory -Force $toolDir | Out-Null
        $archive = Join-Path $toolDir 'hugo.zip'
        Invoke-WebRequest "https://github.com/gohugoio/hugo/releases/download/v$version/hugo_${version}_windows-amd64.zip" -OutFile $archive
        Expand-Archive -LiteralPath $archive -DestinationPath $toolDir -Force
    }
    & $hugo version
    if ($LASTEXITCODE -ne 0) { throw 'Hugo could not start.' }
    if ($Task -ne 'setup') {
        $cache = Join-Path $projectRoot '.tools/cache'
        switch ($Task) {
            'dev' { & $hugo server -D --cacheDir $cache --destination .tools/dev }
            'preview' { & $hugo server --environment production --gc --minify --disableLiveReload --cacheDir $cache --destination .tools/preview }
            'build' { & $hugo --environment production --gc --minify --cacheDir $cache --destination .tools/build }
        }
        if ($LASTEXITCODE -ne 0) { throw "Hugo $Task failed with exit code $LASTEXITCODE." }
    }
} finally {
    Pop-Location
}
