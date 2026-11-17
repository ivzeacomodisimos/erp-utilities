[string[]] $ErpArguments = @($args)
$ErrorActionPreference = 'Stop'
Push-Location -LiteralPath $PSScriptRoot
try {
    if (-not (Test-Path -LiteralPath '.env.docker')) { throw 'Prepare .env.docker a partir de .env.docker.example.' }
    if (-not $ErpArguments -or $ErpArguments.Count -eq 0) { $ErpArguments = @('ps') }
    & docker compose --env-file .env.docker @ErpArguments
    $erpExitCode = $LASTEXITCODE
} finally { Pop-Location }
exit $erpExitCode
