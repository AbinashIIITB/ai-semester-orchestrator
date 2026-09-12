<#
.SYNOPSIS
Deploys the AI Semester Orchestrator backend to GCP Cloud Run.

.DESCRIPTION
This script builds a Docker container, pushes it to Google Artifact Registry,
and deploys it to Cloud Run. It requires the gcloud CLI to be installed and authenticated.

.EXAMPLE
.\deploy.ps1 -ProjectID "my-gcp-project-123" -Region "us-central1"
#>

param (
    [Parameter(Mandatory=$true)]
    [string]$ProjectID,

    [Parameter(Mandatory=$false)]
    [string]$Region = "us-central1",

    [Parameter(Mandatory=$false)]
    [string]$ServiceName = "ai-semester-backend",

    [Parameter(Mandatory=$false)]
    [string]$RepoName = "aisem-repo"
)

$ErrorActionPreference = "Stop"

Write-Host "Starting deployment process to GCP..." -ForegroundColor Cyan

# 1. Ensure gcloud is configured to use the correct project
Write-Host "Setting GCP Project to $ProjectID..."
gcloud config set project $ProjectID

# 2. Enable necessary APIs (Cloud Build, Cloud Run, Artifact Registry)
Write-Host "Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com run.googleapis.com artifactregistry.googleapis.com

# 3. Check if Artifact Registry repository exists, create if it doesn't
Write-Host "Checking Artifact Registry repository '$RepoName'..."
$repoExists = gcloud artifacts repositories describe $RepoName --location=$Region --format="value(name)" 2>$null
if (-not $repoExists) {
    Write-Host "Creating repository '$RepoName'..." -ForegroundColor Yellow
    gcloud artifacts repositories create $RepoName --repository-format=docker --location=$Region --description="AI Semester Backend Images"
} else {
    Write-Host "Repository exists."
}

# 4. Build the image using Cloud Build
$imagePath = "$Region-docker.pkg.dev/$ProjectID/$RepoName/$ServiceName:latest"
Write-Host "Building Docker image: $imagePath" -ForegroundColor Cyan
gcloud builds submit --tag $imagePath .

# 5. Deploy to Cloud Run
Write-Host "Deploying to Cloud Run..." -ForegroundColor Cyan
gcloud run deploy $ServiceName `
    --image $imagePath `
    --region $Region `
    --allow-unauthenticated `
    --port 8000 `
    --memory 512Mi `
    --set-env-vars="OPENAI_MODEL=gpt-4o,OPENAI_EMBEDDING_MODEL=text-embedding-3-small" `
    --update-secrets="DATABASE_URL=DATABASE_URL:latest,OPENAI_API_KEY=OPENAI_API_KEY:latest"

Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "NOTE: You must configure DATABASE_URL and OPENAI_API_KEY in GCP Secret Manager for the service to start successfully." -ForegroundColor Yellow
