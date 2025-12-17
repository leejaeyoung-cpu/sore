# PowerShell script to update VAPID key in Vercel

Write-Host "Updating VITE_FIREBASE_VAPID_KEY in Vercel..." -ForegroundColor Green

# Get current VAPID key from .env.local
$vapidLine = Get-Content .env.local | Select-String "VITE_FIREBASE_VAPID_KEY"
if ($vapidLine) {
    $vapidKey = ($vapidLine -split '=', 2)[1].Trim()
    Write-Host "Found VAPID key: $($vapidKey.Substring(0, 20))..." -ForegroundColor Yellow
    
    # Update in Vercel
    Write-Host "Updating in Vercel Production environment..." -ForegroundColor Cyan
    $vapidKey | npx vercel env add VITE_FIREBASE_VAPID_KEY production
    
    Write-Host "`nVAPID key updated successfully!" -ForegroundColor Green
}
else {
    Write-Host "VAPID key not found in .env.local!" -ForegroundColor Red
}
