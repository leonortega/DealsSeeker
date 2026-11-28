param([string]$Serial = 'emulator-5554')

$adb = 'C:\Users\marce\AppData\Local\Android\Sdk\platform-tools\adb.exe'
& $adb -s $Serial shell am force-stop com.anonymous.dealsseekerreactnative
Start-Sleep -Milliseconds 800
& $adb -s $Serial shell am start -n com.anonymous.dealsseekerreactnative/.MainActivity | Out-Null
Start-Sleep -Seconds 5
# Dev launcher's cached server row sits at the centre of [72,564][1008,774].
& $adb -s $Serial shell input tap 540 669
Start-Sleep -Seconds 12
# The app boots into the immersive feed; one Back returns to the standard shell.
& $adb -s $Serial shell input keyevent 4
Start-Sleep -Seconds 2
& $adb -s $Serial shell dumpsys activity activities | Select-String -Pattern 'topResumedActivity' | Select-Object -First 1
