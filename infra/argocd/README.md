# Anexo GitOps: ArgoCD

## Proposito

Demostrar el flujo GitOps declarativo: el repositorio Git como unica fuente de verdad, ArgoCD como operador que reconcilia el estado del cluster con el estado declarado, y la etiqueta versionada `vX.Y.Z` como punto de reconciliacion.

## Estructura

```
infra/
  k8s/
    deployment.yaml     Deployment + Service sinteticos con imagen vX.Y.Z
  argocd/
    application.yaml    Application de ArgoCD apuntando al tag vX.Y.Z
    README.md           Esta documentacion
```

## Como levantar el entorno de demostracion

### 1. Crear cluster local

```bash
kind create cluster --name alvas-gitops
```

### 2. Instalar ArgoCD

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

### 3. Obtener password inicial

```bash
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```

### 4. Crear la Application apuntando al tag

```bash
# Reemplazar vX.Y.Z por la etiqueta real publicada
kubectl apply -f infra/argocd/application.yaml
```

### 5. Sincronizar y verificar

```bash
argocd app sync alvas-api
argocd app get alvas-api
```

El estado debe mostrar `Synced` y `Healthy`.

### 6. Rollback

```bash
argocd app rollback alvas-api <revision-anterior>
```

## Parametrizacion

Antes de aplicar, reemplazar `vX.Y.Z` en:

- `infra/k8s/deployment.yaml` (label `version` e `image`)
- `infra/argocd/application.yaml` (`targetRevision`)

por la etiqueta de release real publicada en el repositorio.
