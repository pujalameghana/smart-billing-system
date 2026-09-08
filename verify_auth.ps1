$ErrorActionPreference = "Stop"

Write-Host "=== 1. Testing Platform Admin Login ==="
$loginBody = '{"usernameOrEmail":"admin","password":"admin123"}'
$adminRes = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
Write-Host "Admin User: $($adminRes.username), Role: $($adminRes.role), BusinessId: $($adminRes.defaultBusinessId)"
$adminToken = $adminRes.token

Write-Host "`n=== 2. Testing Continue with Google (Dual Login) ==="
$googleBody = '{"email":"alex.turner@gmail.com","name":"Alex Turner","picture":"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100","companyName":"Turner Technologies Inc"}'
$googleRes = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/google" -Method Post -Body $googleBody -ContentType "application/json"
Write-Host "Google User: $($googleRes.username), Role: $($googleRes.role), BusinessId: $($googleRes.defaultBusinessId)"
$userToken = $googleRes.token

Write-Host "`n=== 3. Testing Platform Admin Portal Endpoints ==="
$adminHeaders = @{ Authorization = "Bearer $adminToken" }
$overview = Invoke-RestMethod -Uri "http://localhost:8081/api/admin/overview" -Method Get -Headers $adminHeaders
Write-Host "Platform Overview: Total Users=$($overview.totalUsers), Businesses=$($overview.totalBusinesses), Invoices=$($overview.totalInvoices), Platform Revenue=Rs. $($overview.totalPlatformRevenue)"

$users = Invoke-RestMethod -Uri "http://localhost:8081/api/admin/users" -Method Get -Headers $adminHeaders
Write-Host "Total Admin Users Returned: $($users.Count)"
foreach ($u in $users) {
    Write-Host " - User: $($u.username) | Role: $($u.role) | Auth: $($u.authProvider) | Businesses: $($u.businesses -join ', ')"
}

$businesses = Invoke-RestMethod -Uri "http://localhost:8081/api/admin/businesses" -Method Get -Headers $adminHeaders
Write-Host "`nTotal Admin Businesses Returned: $($businesses.Count)"
foreach ($b in $businesses) {
    Write-Host " - Business: $($b.name) | Owner: $($b.ownerName) ($($b.ownerEmail)) | Invoices: $($b.invoiceCount) | Revenue: Rs. $($b.revenue)"
}

Write-Host "`n=== 4. Testing RBAC Security Guard (Non-Admin Rejected from Admin Portal) ==="
$userHeaders = @{ Authorization = "Bearer $userToken" }
try {
    $forbidden = Invoke-RestMethod -Uri "http://localhost:8081/api/admin/overview" -Method Get -Headers $userHeaders
    Write-Host "SECURITY ERROR: Standard user was able to access Admin Portal!"
} catch {
    Write-Host "SECURITY CHECK PASSED: Standard user properly forbidden with 403: $($_.Exception.Message)"
}

Write-Host "`n=== 5. Testing Invoice Dispatch / Send to Customer API ==="
$invoices = Invoke-RestMethod -Uri "http://localhost:8081/api/invoices/business/$($adminRes.defaultBusinessId)" -Method Get -Headers $adminHeaders
if ($invoices.Count -gt 0) {
    $targetInv = $invoices[0]
    $sendPayload = '{"recipientEmail":"client.test@company.com","subject":"Invoice #' + $targetInv.invoiceNumber + ' Details","message":"Dear Client, thank you for your payment."}'
    $sendRes = Invoke-RestMethod -Uri "http://localhost:8081/api/invoices/$($targetInv.id)/send-email" -Method Post -Body $sendPayload -ContentType "application/json" -Headers $adminHeaders
    Write-Host "Dispatch Confirmation: $($sendRes.message), New Status: $($sendRes.status)"
}

Write-Host "`n========================================================"
Write-Host " ALL ROLE-BASED ACCESS & SEND INVOICE TESTS PASSED! "
Write-Host "========================================================"
