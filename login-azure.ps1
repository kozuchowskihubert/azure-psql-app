

# --- Azure PowerShell Automation ---
# --- Parameters ---
param(
	[string]$AppName = "MyAutomationApp",
	[string]$Role = "Contributor",
	[string]$SubscriptionId
)

# --- Azure PowerShell Automation ---
# 1. Install Az module if needed
if (-not (Get-Module -ListAvailable -Name Az)) {
	Write-Host "Installing Azure PowerShell module..."
	Install-Module -Name Az -Scope CurrentUser -Repository PSGallery -Force
}
Import-Module Az


# Initial authentication step (run separately if needed)
# To authenticate interactively, run:
# pwsh -c 'Connect-AzAccount'

# 2. If .env.local does not have SPN credentials, create SPN and output them
$envFile = "./azure-psql-app/infra/.env.local"
$lines = Get-Content $envFile | Where-Object { $_ -and $_ -notmatch '^#' }
if ($lines.Count -lt 3 -or $lines[0] -match '^spn_password=' -or $lines[1] -match '^spn_client_id=' -or $lines[2] -match '^spn_tenant_id=') {
	Write-Host "No valid SPN credentials found in .env.local. Creating new SPN..."
	if (-not $SubscriptionId) {
		$subs = Get-AzSubscription | Sort-Object -Property CreatedDate -Descending
		if ($subs.Count -eq 0) {
			Write-Error "No Azure subscriptions found. Please create one in the Azure Portal."
			exit 1
		}
		$SubscriptionId = $subs[0].Id
		Write-Host "Using newest subscription: $SubscriptionId"
	}
	Set-AzContext -SubscriptionId $SubscriptionId
	$app = New-AzADApplication -DisplayName $AppName
	$spn = New-AzADServicePrincipal -ApplicationId $app.ApplicationId
	$secret = New-AzADAppCredential -ObjectId $app.Id -EndDate (Get-Date).AddYears(2)
	New-AzRoleAssignment -ObjectId $spn.Id -RoleDefinitionName $Role -Scope "/subscriptions/$SubscriptionId"
	$spn_client_id = $app.ApplicationId
	$spn_tenant_id = $spn.AppOwnerOrganizationId
	$spn_password = $secret.SecretText
	Set-Content $envFile "$spn_password`n$spn_client_id`n$spn_tenant_id"
	Write-Host "SPN created and credentials saved to .env.local."
	$lines = @($spn_password, $spn_client_id, $spn_tenant_id)
}

# 3. Authenticate using .env.local
if ($lines.Count -lt 3) {
	Write-Error "ERROR: .env.local must have at least 3 lines."
	exit 1
}
$third = $lines[2].Trim()
if ($third -match "^[0-9a-fA-F-]{36}$") {
	$spnPassword = $lines[0].Trim()
	$spnClientId = $lines[1].Trim()
	$spnTenantId = $third
	Write-Host "Authenticating with Azure using Service Principal..."
	$securePassword = ConvertTo-SecureString $spnPassword -AsPlainText -Force
	$credential = New-Object System.Management.Automation.PSCredential($spnClientId, $securePassword)
	Connect-AzAccount -ServicePrincipal -ApplicationId $spnClientId -Tenant $spnTenantId -Credential $credential
} else {
	$azureEmail = $third
	Write-Host "Logging in interactively with Azure account: $azureEmail"
	Connect-AzAccount -UserName $azureEmail
}

# 4. List subscriptions, select newest, set context
$subs = Get-AzSubscription | Sort-Object -Property CreatedDate -Descending
if ($subs.Count -eq 0) {
	Write-Host "No Azure subscriptions found for this account. Please create one in the Azure Portal: https://portal.azure.com/#blade/Microsoft_Azure_Billing/SubscriptionsBlade"
	exit 1
}
Write-Host "Available subscriptions:"
$subs | ForEach-Object { Write-Host ("ID: {0} | Name: {1} | Created: {2}" -f $_.Id, $_.Name, $_.CreatedDate) }
$newestSub = $subs[0]
Write-Host "Using newest subscription: $($newestSub.Id) ($($newestSub.Name))"
Set-AzContext -SubscriptionId $newestSub.Id

# 5. Resource creation (placeholder)
Write-Host "Ready to create resources as per requirements (App Service, DB, VNet, etc.) via Terraform or Az commands."


# 2. Authenticate first
$envFile = "./azure-psql-app/infra/.env.local"
$lines = Get-Content $envFile | Where-Object { $_ -and $_ -notmatch '^#' }
if ($lines.Count -lt 3) {
	Write-Error "ERROR: .env.local must have at least 3 lines."
	exit 1
}
$third = $lines[2].Trim()
if ($third -match "^[0-9a-fA-F-]{36}$") {
	$spnPassword = $lines[0].Trim()
	$spnClientId = $lines[1].Trim()
	$spnTenantId = $third
	Write-Host "Authenticating with Azure using Service Principal..."
	$securePassword = ConvertTo-SecureString $spnPassword -AsPlainText -Force
	$credential = New-Object System.Management.Automation.PSCredential($spnClientId, $securePassword)
	Connect-AzAccount -ServicePrincipal -ApplicationId $spnClientId -Tenant $spnTenantId -Credential $credential
} else {
	$azureEmail = $third
	Write-Host "Logging in interactively with Azure account: $azureEmail"
	Connect-AzAccount -UserName $azureEmail
}

# 3. List subscriptions, select newest, set context
$subs = Get-AzSubscription | Sort-Object -Property CreatedDate -Descending
if ($subs.Count -eq 0) {
	Write-Host "No Azure subscriptions found for this account. Please create one in the Azure Portal: https://portal.azure.com/#blade/Microsoft_Azure_Billing/SubscriptionsBlade"
	exit 1
}
Write-Host "Available subscriptions:"
$subs | ForEach-Object { Write-Host ("ID: {0} | Name: {1} | Created: {2}" -f $_.Id, $_.Name, $_.CreatedDate) }
$newestSub = $subs[0]
Write-Host "Using newest subscription: $($newestSub.Id) ($($newestSub.Name))"
Set-AzContext -SubscriptionId $newestSub.Id

# 4. Resource creation (placeholder)
Write-Host "Ready to create resources as per requirements (App Service, DB, VNet, etc.) via Terraform or Az commands."
