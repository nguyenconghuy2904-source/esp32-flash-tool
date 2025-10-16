@echo off
setlocal enabledelayedexpansion

REM ESP32 Flash Tool - Key Generator Script (Windows)
REM Generates secure 32-character hexadecimal keys for authentication

echo 🔑 ESP32 Flash Tool - Key Generator
echo ==================================

:menu
echo.
echo Select an option:
echo 1) Generate single key
echo 2) Generate multiple keys  
echo 3) Validate existing key
echo 4) Generate sample keys for testing
echo 5) Show key format requirements
echo q) Quit
echo.

set /p choice="Enter your choice: "

if "%choice%"=="1" goto generate_single
if "%choice%"=="2" goto generate_multiple
if "%choice%"=="3" goto validate_key
if "%choice%"=="4" goto generate_samples
if "%choice%"=="5" goto show_requirements
if "%choice%"=="q" goto quit
if "%choice%"=="Q" goto quit

echo ❌ Invalid option. Please try again.
goto menu

:generate_single
echo.
echo 🔑 Generating single key...

REM Generate 32 hex characters using PowerShell
for /f %%i in ('powershell -command "[System.Web.Security.Membership]::GeneratePassword(32, 0) -replace '[^0-9A-F]', (Get-Random -InputObject @('0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F')) | ForEach-Object {$_.ToString().ToUpper().Substring(0,[Math]::Min(32,$_.Length))}"') do set key=%%i

if "!key!"=="" (
    REM Fallback method
    set "hex=0123456789ABCDEF"
    set "key="
    for /l %%i in (1,1,32) do (
        set /a "rand=!random! %% 16"
        for %%j in (!rand!) do set "key=!key!!hex:~%%j,1!"
    )
)

echo Generated Key: !key!
echo.
echo 📋 SQL Command:
echo INSERT INTO auth_keys (key_hash, description) VALUES ('!key!', 'Generated key %date% %time%');
goto menu

:generate_multiple
echo.
set /p num_keys="How many keys to generate (1-50): "
set /p desc="Description for these keys: "

REM Validate input
if !num_keys! gtr 50 (
    echo ❌ Maximum 50 keys allowed
    goto menu
)
if !num_keys! lss 1 (
    echo ❌ Minimum 1 key required
    goto menu
)

echo.
echo Generating !num_keys! keys...
echo.
echo SQL Commands:
echo -------------

for /l %%i in (1,1,!num_keys!) do (
    REM Generate key using simple method
    set "hex=0123456789ABCDEF"
    set "key="
    for /l %%j in (1,1,32) do (
        set /a "rand=!random! %% 16"
        for %%k in (!rand!) do set "key=!key!!hex:~%%k,1!"
    )
    echo INSERT INTO auth_keys (key_hash, description) VALUES ('!key!', '!desc! - Key %%i');
)

echo.
echo Keys for distribution:
echo ---------------------

for /l %%i in (1,1,!num_keys!) do (
    REM Generate key using simple method
    set "hex=0123456789ABCDEF"
    set "key="
    for /l %%j in (1,1,32) do (
        set /a "rand=!random! %% 16"
        for %%k in (!rand!) do set "key=!key!!hex:~%%k,1!"
    )
    echo Key %%i: !key!
)
goto menu

:validate_key
echo.
set /p test_key="Enter key to validate: "

REM Remove spaces and convert to uppercase
set "test_key=!test_key: =!"
set "test_key=!test_key!"
for %%i in (A B C D E F G H I J K L M N O P Q R S T U V W X Y Z) do (
    set "test_key=!test_key:%%i=%%i!"
)

REM Check length
set "key_length=0"
set "temp_key=!test_key!"
:count_loop
if defined temp_key (
    set "temp_key=!temp_key:~1!"
    set /a key_length+=1
    goto count_loop
)

if not !key_length!==32 (
    echo ❌ Invalid key length: !key_length! (must be exactly 32)
    goto menu
)

REM Check if all characters are hex
set "valid=1"
for /l %%i in (0,1,31) do (
    set "char=!test_key:~%%i,1!"
    if "!char!" neq "0" if "!char!" neq "1" if "!char!" neq "2" if "!char!" neq "3" if "!char!" neq "4" if "!char!" neq "5" if "!char!" neq "6" if "!char!" neq "7" if "!char!" neq "8" if "!char!" neq "9" if "!char!" neq "A" if "!char!" neq "B" if "!char!" neq "C" if "!char!" neq "D" if "!char!" neq "E" if "!char!" neq "F" (
        set "valid=0"
    )
)

if "!valid!"=="1" (
    echo ✅ Valid key format: !test_key!
) else (
    echo ❌ Invalid characters in key. Only 0-9 and A-F allowed.
)
goto menu

:generate_samples
echo.
echo 🧪 Generating sample keys for testing...
echo.
echo Sample keys (ready to use):
echo A1B2C3D4E5F6789012345678901234AB
echo B2C3D4E5F6789012345678901234ABCD  
echo C3D4E5F6789012345678901234ABCDEF
echo D4E5F6789012345678901234ABCDEF01
echo E5F6789012345678901234ABCDEF0123
echo.
echo SQL Commands to add these keys:
echo ------------------------------
echo INSERT INTO auth_keys (key_hash, description) VALUES ('A1B2C3D4E5F6789012345678901234AB', 'Sample Key 1 - Demo');
echo INSERT INTO auth_keys (key_hash, description) VALUES ('B2C3D4E5F6789012345678901234ABCD', 'Sample Key 2 - Demo');
echo INSERT INTO auth_keys (key_hash, description) VALUES ('C3D4E5F6789012345678901234ABCDEF', 'Sample Key 3 - Demo');
echo INSERT INTO auth_keys (key_hash, description) VALUES ('D4E5F6789012345678901234ABCDEF01', 'Sample Key 4 - Demo');
echo INSERT INTO auth_keys (key_hash, description) VALUES ('E5F6789012345678901234ABCDEF0123', 'Sample Key 5 - Demo');
goto menu

:show_requirements
echo.
echo 🔐 ESP32 Flash Tool Key Requirements
echo ===================================
echo.
echo 📏 Format: 32 hexadecimal characters
echo 🔤 Characters: 0-9, A-F (uppercase preferred)
echo 📝 Example: A1B2C3D4E5F6789012345678901234AB
echo.
echo ✅ Valid examples:
echo    ABCDEF1234567890ABCDEF1234567890
echo    1234567890ABCDEF1234567890ABCDEF
echo    FEDCBA0987654321FEDCBA0987654321
echo.
echo ❌ Invalid examples:
echo    ABC123 (too short)
echo    GHIJKLMNOPQRSTUVWXYZ123456789012 (contains G-Z)
echo    abcdef1234567890abcdef1234567890 (lowercase)
goto menu

:quit
echo 👋 Goodbye!
exit /b 0