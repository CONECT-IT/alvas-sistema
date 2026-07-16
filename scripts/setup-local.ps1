#!/usr/bin/env pwsh

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ALVAS Sistema - Setup Local" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check Docker
Write-Host "[1/6] Checking Docker..." -ForegroundColor Yellow
$dockerStatus = docker info 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}
Write-Host "✓ Docker is running" -ForegroundColor Green

# Step 2: Check/Start Minikube
Write-Host "[2/6] Checking Minikube..." -ForegroundColor Yellow
$minikubeStatus = minikube status --format "{{.Host}}" 2>$null
if ($minikubeStatus -ne "Running") {
    Write-Host "Starting Minikube..." -ForegroundColor Cyan
    minikube start --driver=docker --cpus=4 --memory=8192 --disk-size=20gb
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to start Minikube" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✓ Minikube is running" -ForegroundColor Green

# Step 3: Install ArgoCD if not present
Write-Host "[3/6] Checking ArgoCD..." -ForegroundColor Yellow
$argocdExists = kubectl get namespace argocd 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Installing ArgoCD..." -ForegroundColor Cyan
    kubectl create namespace argocd
    kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
    Write-Host "Waiting for ArgoCD to be ready..." -ForegroundColor Cyan
    Start-Sleep -Seconds 30
}
Write-Host "✓ ArgoCD is installed" -ForegroundColor Green

# Step 4: Install Prometheus + Grafana if not present
Write-Host "[4/6] Checking Prometheus/Grafana..." -ForegroundColor Yellow
$monitoringExists = kubectl get namespace monitoring 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Installing Prometheus stack..." -ForegroundColor Cyan
    helm repo add prometheus-community https://prometheus-community.github.io/helm-charts 2>$null
    helm repo update 2>$null
    helm install kube-prometheus prometheus-community/kube-prometheus-stack -n monitoring --create-namespace
    Write-Host "Waiting for Prometheus to be ready..." -ForegroundColor Cyan
    Start-Sleep -Seconds 30
}
Write-Host "✓ Prometheus/Grafana installed" -ForegroundColor Green

# Step 5: Install Chaos Mesh if not present
Write-Host "[5/6] Checking Chaos Mesh..." -ForegroundColor Yellow
$chaosExists = kubectl get namespace chaos-testing 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Installing Chaos Mesh..." -ForegroundColor Cyan
    helm repo add chaos-mesh https://charts.chaos-mesh.org 2>$null
    helm repo update 2>$null
    helm install chaos-mesh chaos-mesh/chaos-mesh -n chaos-testing --create-namespace --set dashboard.create=true
    Write-Host "Waiting for Chaos Mesh to be ready..." -ForegroundColor Cyan
    Start-Sleep -Seconds 20
}
Write-Host "✓ Chaos Mesh installed" -ForegroundColor Green

# Step 6: Build and deploy ALVAS API
Write-Host "[6/6] Building and deploying ALVAS API..." -ForegroundColor Yellow
& "$PSScriptRoot\build-local.ps1"

Write-Host "Deploying to Kubernetes..." -ForegroundColor Cyan
kubectl apply -f infra/k8s/deployment.yaml

Write-Host "Waiting for ALVAS API to be ready..." -ForegroundColor Cyan
kubectl wait --for=condition=ready pod -l app=alvas-api --timeout=120s

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Access your services:" -ForegroundColor Cyan
Write-Host ""
Write-Host "ALVAS API:" -ForegroundColor White
Write-Host "  kubectl port-forward svc/alvas-api 8080:80" -ForegroundColor Gray
Write-Host "  http://localhost:8080/health" -ForegroundColor Gray
Write-Host ""
Write-Host "ArgoCD:" -ForegroundColor White
Write-Host "  kubectl port-forward svc/argocd-server -n argocd 8443:443" -ForegroundColor Gray
Write-Host "  https://localhost:8443" -ForegroundColor Gray
Write-Host "  User: admin" -ForegroundColor Gray
Write-Host "  Pass: kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' | base64 -d" -ForegroundColor Gray
Write-Host ""
Write-Host "Grafana:" -ForegroundColor White
Write-Host "  kubectl port-forward svc/kube-prometheus-grafana -n monitoring 3000:80" -ForegroundColor Gray
Write-Host "  http://localhost:3000" -ForegroundColor Gray
Write-Host "  User: admin" -ForegroundColor Gray
Write-Host "  Pass: prom-operator" -ForegroundColor Gray
Write-Host ""
Write-Host "Chaos Mesh:" -ForegroundColor White
Write-Host "  kubectl port-forward svc/chaos-dashboard -n chaos-testing 2333:2333" -ForegroundColor Gray
Write-Host "  http://localhost:2333" -ForegroundColor Gray
Write-Host ""
