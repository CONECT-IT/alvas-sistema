# ALVAS Sistema - Setup Local con Minikube

Esta guía explica cómo ejecutar el sistema ALVAS localmente usando Minikube, ArgoCD, Prometheus/Grafana y Chaos Mesh.

## Requisitos

- **Docker Desktop** instalado y corriendo
- **Minikube** instalado
- **kubectl** instalado
- **Helm** instalado
- **PowerShell 7+** (Windows) o **bash** (Linux/Mac)

## Instalación rápida

```powershell
# En Windows PowerShell
.\scripts\setup-local.ps1
```

Este script:

1. Verifica que Docker esté corriendo
2. Inicia Minikube con 4 CPUs y 8GB RAM
3. Instala ArgoCD
4. Instala Prometheus + Grafana
5. Instala Chaos Mesh
6. Construye y despliega la API de ALVAS

## Instalación manual paso a paso

### 1. Iniciar Minikube

```powershell
minikube start --driver=docker --cpus=4 --memory=8192 --disk-size=20gb
```

### 2. Instalar ArgoCD

```powershell
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

### 3. Instalar Prometheus + Grafana

```powershell
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install kube-prometheus prometheus-community/kube-prometheus-stack -n monitoring --create-namespace
```

### 4. Instalar Chaos Mesh

```powershell
helm repo add chaos-mesh https://charts.chaos-mesh.org
helm repo update
helm install chaos-mesh chaos-mesh/chaos-mesh -n chaos-testing --create-namespace --set dashboard.create=true
```

### 5. Construir y cargar la imagen Docker

```powershell
# Construir la imagen
docker build -t alvas-api:local -f Dockerfile .

# Cargar en Minikube
minikube image load alvas-api:local
```

### 6. Desplegar la API

```powershell
kubectl apply -f infra/k8s/deployment.yaml
```

## Acceder a los servicios

### ALVAS API

```powershell
kubectl port-forward svc/alvas-api 8080:80
```

Abre: http://localhost:8080/health

### ArgoCD

```powershell
kubectl port-forward svc/argocd-server -n argocd 8443:443
```

Abre: https://localhost:8443

**Credenciales:**

- Usuario: `admin`
- Password: Ejecuta `kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d`

### Grafana

```powershell
kubectl port-forward svc/kube-prometheus-grafana -n monitoring 3000:80
```

Abre: http://localhost:3000

**Credenciales:**

- Usuario: `admin`
- Password: `prom-operator`

### Prometheus

```powershell
kubectl port-forward svc/kube-prometheus-kube-prome-prometheus -n monitoring 9090:9090
```

Abre: http://localhost:9090

### Chaos Mesh Dashboard

```powershell
kubectl port-forward svc/chaos-dashboard -n chaos-testing 2333:2333
```

Abre: http://localhost:2333

## Inicializar la base de datos

```powershell
.\scripts\init-db.ps1
```

O manualmente:

```powershell
# Ejecutar migraciones desde la raíz del proyecto
cd C:\Users\wv357\Collegue\alvas-sistema
bunx drizzle-kit push --force
```

## Comandos útiles

```powershell
# Ver estado de pods
kubectl get pods

# Ver logs de la API
kubectl logs -l app=alvas-api -f

# Reiniciar la API
kubectl rollout restart deployment/alvas-api

# Detener Minikube
minikube stop

# Iniciar Minikube (después de detener)
minikube start

# Eliminar Minikube
minikube delete
```

## Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                      Minikube Cluster                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  ArgoCD      │    │  Prometheus  │    │  Chaos Mesh  │  │
│  │  (argocd)    │    │  + Grafana   │    │  (chaos-     │  │
│  │              │    │  (monitoring)│    │   testing)   │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              ALVAS API (alvas)                        │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│  │  │   Hono API  │  │  SQLite DB  │  │  /health    │  │  │
│  │  │  :8787      │  │  /app/data  │  │  /metrics   │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Troubleshooting

### Docker no está corriendo

```powershell
# Inicia Docker Desktop desde el menú inicio
# Espera a que diga "Docker Desktop is running"
```

### Minikube no inicia

```powershell
minikube delete
minikube start --driver=docker --cpus=4 --memory=8192
```

### Imagen no se carga en Minikube

```powershell
# Método alternativo
docker save alvas-api:local -o alvas-api.tar
minikube image load alvas-api.tar
Remove-Item alvas-api.tar
```

### Pod no inicia

```powershell
# Ver logs
kubectl logs -l app=alvas-api

# Ver eventos
kubectl describe pod -l app=alvas-api
```

## Siguientes pasos

Una vez que todo esté funcionando:

1. **S13**: Configurar versionamiento SemVer y pipeline GitOps
2. **S14**: Configurar dashboards de SLIs/SLOs en Grafana
3. **S15**: Ejecutar experimentos de Chaos Engineering
4. **S16**: Probar drift detection con ArgoCD
