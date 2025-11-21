
# Install Microsoft Graph module if not already installed
if (-not (Get-Module -ListAvailable -Name Microsoft.Graph)) {
    Install-Module Microsoft.Graph -Scope CurrentUser -Force
}

Import-Module Microsoft.Graph
Connect-MgGraph -Scopes "RoleManagement.ReadWrite.Directory, Directory.ReadWrite.All"

# Get the Service Principal object
$sp = Get-MgServicePrincipal -Filter "appId eq '2e5f11fd-2ebc-4869-8ce8-cfe51f37989a'"

# Get the Application Administrator role definition
$roleDef = Get-MgDirectoryRoleTemplate | Where-Object { $_.DisplayName -eq "Application Administrator" }
if (-not $roleDef) {
    Write-Error "Application Administrator role template not found."
    exit 1
}

# Enable the role if not already enabled
$role = Get-MgDirectoryRole | Where-Object { $_.DisplayName -eq "Application Administrator" }
if (-not $role) {
    $role = Invoke-MgDirectoryRole -DirectoryRoleTemplateId $roleDef.Id
}

# Assign the role to the Service Principal
New-MgDirectoryRoleMember -DirectoryRoleId $role.Id -MemberId $sp.Id