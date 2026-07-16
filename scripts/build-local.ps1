#!/usr/bin/env pwsh

Write-Host "Building ALVAS API Docker image..." -ForegroundColor Green

# Build the image
docker build -t alvas-api:local -f Dockerfile .

if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Loading image into Minikube..." -ForegroundColor Green

# Load the image into Minikube
minikube image load alvas-api:local

if ($LASTEXITCODE -ne 0) {
    Write-Host "Minikube image load failed! Trying alternative method..." -ForegroundColor Yellow
    
    # Alternative: save and load manually
    docker save alvas-api:local -o alvas-api.tar
    minikube image load alvas-api.tar
    Remove-Item alvas-api.tar
}

Write-Host "Image loaded successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "To deploy, run:" -ForegroundColor Cyan
Write-Host "  kubectl apply -f infra/k8s/deployment.yaml" -ForegroundColor White
Write-Host ""
Write-Host "To check status:" -ForegroundColor Cyan
Write-Host "  kubectl get pods -l app=alvas-api" -ForegroundColor White
