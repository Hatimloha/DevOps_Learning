# Lesson 8 — ConfigMaps & Secrets (Configuration Management in Kubernetes)
Now your apps are running with Deployments + Services.

Next problem:
- 👉 How do you manage configuration without rebuilding images?

Examples:
- DB URL
- API keys
- Feature flags
- Environment variables

Kubernetes solves this using:
- ConfigMap (non-sensitive data)
- Secret (sensitive data)

## 1. Problem Without ConfigMaps
If config is inside image:
```bash
Docker Image → needs rebuild for every config change ❌
```
Bad for production.

## 2. ConfigMap (Non-Sensitive Data)
Used for:
- URLs
- Config values
- Feature flags

### Example: ConfigMap
```yml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config

data:
  DB_HOST: "mysql-service"
  DB_PORT: "3306"
  ENV: "production"
```

## 3. Using ConfigMap in Pod (ENV variables)
```yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app

spec:
  replicas: 2

  selector:
    matchLabels:
      app: myapp

  template:
    metadata:
      labels:
        app: myapp

    spec:
      containers:
        - name: myapp
          image: nginx

          env:
            - name: DB_HOST
              valueFrom:
                configMapKeyRef:
                  name: app-config
                  key: DB_HOST

            - name: DB_PORT
              valueFrom:
                configMapKeyRef:
                  name: app-config
                  key: DB_PORT
```
## 4. Inject Full ConfigMap as ENV
Instead of mapping one-by-one:
```yml
envFrom:
  - configMapRef:
      name: app-config
```

## 5. Secrets (Sensitive Data)
Used for:
- Passwords
- API keys
- Tokens

### Example Secret
```yml
apiVersion: v1
kind: Secret
metadata:
  name: app-secret

type: Opaque

data:
  DB_PASSWORD: cGFzc3dvcmQ=   # base64 encoded
```

👉 Important: Kubernetes stores Secrets in base64, not plain text.

## 6. Create Secret (Easier Way)
Instead of writing base64 manually:
```bash
kubectl create secret generic app-secret \
--from-literal=DB_PASSWORD=password123
```

## 7. Using Secret in Deployment
```yml
env:
  - name: DB_PASSWORD
    valueFrom:
      secretKeyRef:
        name: app-secret
        key: 
```

## 8. ConfigMap vs Secret
| Feature   | ConfigMap     | Secret      |
| --------- | ------------- | ----------- |
| Data type | Non-sensitive | Sensitive   |
| Encoding  | Plain text    | Base64      |
| Example   | DB_HOST       | DB_PASSWORD |
| Security  | Low           | Higher      |


## 9. Why Secrets are NOT fully secure
Important truth:

👉 Secrets are only base64 encoded (not encrypted by default)

For real security:
- Use encryption at rest
- Use external tools like:
    - AWS Secrets Manager
    - Vault (HashiCorp)

## 10. kubectl Commands
ConfigMaps
```bash
kubectl get configmaps

kubectl describe configmap app-config
```

Secrets
```bash
kubectl get secrets

kubectl describe secret app-secret
```

Decode Secret
```bash
kubectl get secret app-secret -o yaml
```

Decode:
```bash
echo "cGFzc3dvcmQ=" | base64 --decode
```

## 11. Real Architecture
```bash
ConfigMap  → app settings
Secret     → credentials
Deployment → uses both
Pod        → runs app
```

## 12. Real Production Flow
```bash
Dev updates config
     ↓
ConfigMap updated
     ↓
Pod restarted (optional)
     ↓
New config applied

No image rebuild needed.
```

## 13. Common Mistakes
❌ Wrong key name
```
key: DBHOST
```
but ConfigMap has:
```
DB_HOST
```
➡️ Pod fails

❌ Forget base64 in Secret
```
Secrets MUST be encoded.
```

## 14. Interview Questions

1. What is ConfigMap?
    > Stores non-sensitive configuration data in key-value format.

2. What is Secret?
    > Stores sensitive data like passwords and tokens.

3. Why use ConfigMap?
    > To avoid rebuilding images for config changes.

4. Are Secrets encrypted?
    > No, only base64 encoded by default.