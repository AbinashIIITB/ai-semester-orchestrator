<#
.SYNOPSIS
Deploys the AI Semester Orchestrator backend to Azure Container Apps.

.DESCRIPTION
This script builds a Docker container using Azure Container Registry (ACR) Tasks,
and deploys it to Azure Container Apps. It requires the az CLI to be installed and authenticated.

.EXAMPLE
.\deploy.ps1 -ResourceGroup "my-resource-group" -Location "eastus" -AcrName "myacr123"
#>

param (
    [Parameter(Mandatory=$true)]
    [string]$ResourceGroup,

    [Parameter(Mandatory=$false)]
    [string]$Location = "eastus",

    [Parameter(Mandatory=$true)]
    [string]$AcrName,

    [Parameter(Mandatory=$false)]
    [string]$ContainerAppName = "aisemester-backend",

    [Parameter(Mandatory=$false)]
    [string]$EnvironmentName = "aisemester-env"
)

$ErrorActionPreference = "Stop"

Write-Host "Starting deployment process to Azure..." -ForegroundColor Cyan

# 1. Check if user is logged in
$account = az account show 2>$null
if (-not $account) {
    Write-Host "You are not logged into Azure CLI. Please run 'az login' first." -ForegroundColor Red
    exit 1
}

# 2. Ensure Resource Group exists
Write-Host "Checking if Resource Group '$ResourceGroup' exists..."
$rgExists = az group exists --name $ResourceGroup
if ($rgExists -eq "false") {
    Write-Host "Creating Resource Group '$ResourceGroup' in '$Location'..." -ForegroundColor Yellow
    az group create --name $ResourceGroup --location $Location | Out-Null
}

# 3. Ensure ACR exists
Write-Host "Checking if ACR '$AcrName' exists..."
$acrExists = az acr check-name --name $AcrName | ConvertFrom-Json
if ($acrExists.nameAvailable -eq $true) {
    Write-Host "Creating Azure Container Registry '$AcrName'..." -ForegroundColor Yellow
    az acr create --resource-group $ResourceGroup --name $AcrName --sku Basic --admin-enabled true | Out-Null
}

# 4. Build image using ACR Tasks
$imageTag = "$AcrName.azurecr.io/$ContainerAppName:latest"
Write-Host "Building Docker image in ACR: $imageTag" -ForegroundColor Cyan
az acr build --registry $AcrName --image "$ContainerAppName:latest" "."

# 5. Ensure Container App Environment exists
Write-Host "Checking Container App Environment '$EnvironmentName'..."
$envExists = az containerapp env show --name $EnvironmentName --resource-group $ResourceGroup 2>$null
if (-not $envExists) {
    Write-Host "Creating Container App Environment (this may take a few minutes)..." -ForegroundColor Yellow
    az containerapp env create --name $EnvironmentName --resource-group $ResourceGroup --location $Location | Out-Null
}

# 6. Deploy to Container App
Write-Host "Deploying to Azure Container Apps..." -ForegroundColor Cyan
az containerapp up `
    --name $ContainerAppName `
    --resource-group $ResourceGroup `
    --environment $EnvironmentName `
    --image $imageTag `
    --target-port 8000 `
    --ingress external `
    --env-vars "DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/db" "OPENAI_API_KEY=sk-placeholder"

Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "NOTE: You must configure DATABASE_URL and OPENAI_API_KEY environment variables in the Azure Portal or using the az cli for the service to start successfully." -ForegroundColor Yellow
