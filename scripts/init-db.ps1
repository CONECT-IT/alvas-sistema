#!/usr/bin/env pwsh

Write-Host "Initializing ALVAS database..." -ForegroundColor Green

# Check if Minikube is running
$minikubeStatus = minikube status --format "{{.Host}}" 2>$null
if ($minikubeStatus -ne "Running") {
    Write-Host "Minikube is not running. Starting..." -ForegroundColor Yellow
    minikube start --driver=docker --cpus=4 --memory=8192 --disk-size=20gb
}

# Check if the pod is running
$podStatus = kubectl get pod -l app=alvas-api -o jsonpath="{.items[0].status.phase}" 2>$null
if ($podStatus -ne "Running") {
    Write-Host "ALVAS API pod is not running. Deploying..." -ForegroundColor Yellow
    kubectl apply -f infra/k8s/deployment.yaml
    Write-Host "Waiting for pod to be ready..." -ForegroundColor Cyan
    kubectl wait --for=condition=ready pod -l app=alvas-api --timeout=120s
}

# Get the pod name
$podName = kubectl get pod -l app=alvas-api -o jsonpath="{.items[0].metadata.name}"

Write-Host "Running database migrations..." -ForegroundColor Green

# Run migrations using drizzle-kit inside the pod
kubectl exec $podName -- bun run db:migrate:local

Write-Host "Database initialized successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "To access the API:" -ForegroundColor Cyan
Write-Host "  kubectl port-forward svc/alvas-api 8080:80" -ForegroundColor White
Write-Host "  curl http://localhost:8080/health" -ForegroundColor White
