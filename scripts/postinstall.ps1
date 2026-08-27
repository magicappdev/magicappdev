# Post-install script: patches node_modules packages for Gradle 9 compatibility
# Run after `bun install` to apply necessary fixes

$ErrorActionPreference = "SilentlyContinue"

# Patch @unimodules/react-native-adapter for Gradle 9 compat
$unimodulesGradle = "node_modules\@unimodules\react-native-adapter\android\build.gradle"
$unimodulesManifest = "node_modules\@unimodules\react-native-adapter\android\src\main\AndroidManifest.xml"

if (Test-Path $unimodulesGradle) {
    Write-Host "Patching @unimodules/react-native-adapter for Gradle 9..."
    $content = Get-Content $unimodulesGradle -Raw

    # Comment out maven plugin (removed in Gradle 9)
    $content = $content -replace "apply plugin: 'maven'", "// apply plugin: 'maven' (removed for Gradle 9)"

    # Comment out uploadArchives block (uses deprecated maven plugin)
    $content = $content -replace "(?s)uploadArchives \{.*?\}", "// uploadArchives block removed for Gradle 9"

    # Comment out unimodules-core apply
    $content = $content -replace "apply from: unimodules_core_gradle", "// apply from: unimodules_core_gradle (removed for Gradle 9)"

    # Comment out unimodule project dependency
    $content = $content -replace "implementation project\(':unimodules-core'\)", "// implementation project(':unimodules-core') (removed for Gradle 9)"

    # Fix deprecated classifier property
    $content = $content -replace "classifier = 'sources'", "archiveClassifier.set('sources')"

    Set-Content $unimodulesGradle $content -NoNewline
    Write-Host "  - Patched build.gradle"
}

if (Test-Path $unimodulesManifest) {
    $manifest = Get-Content $unimodulesManifest -Raw
    if ($manifest -notmatch "tools:replace") {
        $manifest = $manifest -replace '(<meta-data[^>]*android:name="com.unimodules.core.AppLoader"[^>*/])', '$1 tools:replace="android:value"'
        Set-Content $unimodulesManifest $manifest -NoNewline
        Write-Host "  - Patched AndroidManifest.xml"
    }
}

Write-Host "Post-install patches complete."
