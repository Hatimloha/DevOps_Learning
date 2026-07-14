# Lesson 23 — ConfigMaps & Secrets (External Configuration & Secure Data)

In real-world applications, configuration values should **not be hardcoded** inside containers.

Bad practice:

```text
DB_PASSWORD=12345

API_KEY=abc123
```

Problems:

- Security risk
- Configuration changes require rebuilding images
- Different environments need different values

Kubernetes provides two resources:

```text
ConfigMap → Non-sensitive configuration

Secret → Sensitive information
```

---

# 1. What is ConfigMap?

A **ConfigMap** stores non-sensitive application configuration.

Examples:

- Environment variables
- Configuration files
- URLs
- Feature flags
- Application settings

---

## Example ConfigMap

```yaml
apiVersion: v1
kind: ConfigMap

metadata:
  name: app-config

data:
  APP_ENV: production
  DB_HOST: mysql-service
  LOG_LEVEL: info
```

This stores:

```text
APP_ENV = production

DB_HOST = mysql-service

LOG_LEVEL = info
```

---

# 2. Use ConfigMap in Pod

Example:

```yaml
env:
- name: APP_ENV

  valueFrom:
    configMapKeyRef:

      name: app-config

      key: APP_ENV
```

Result:

```text
APP_ENV=production
```

The value comes from Kubernetes ConfigMap.

---

# 3. What is Secret?

A **Secret** stores sensitive information.

Examples:

- Passwords
- API keys
- Tokens
- Certificates

---

## Example Secret

```yaml
apiVersion: v1
kind: Secret

metadata:
  name: db-secret

type: Opaque

data:
  DB_PASSWORD: cGFzc3dvcmQxMjM=
```

---

Important:

Kubernetes Secrets use:

```text
Base64 Encoding
```

They are **NOT encrypted by default**.

Example:

Original:

```text
password123
```

Encoded:

```text
cGFzc3dvcmQxMjM=
```

---

# 4. Use Secret in Pod

Example:

```yaml
env:

- name: DB_PASSWORD

  valueFrom:

    secretKeyRef:

      name: db-secret

      key: DB_PASSWORD
```

Result:

```text
DB_PASSWORD=password123
```

---

# 5. ConfigMap vs Secret

| Feature | ConfigMap | Secret |
|---|---|---|
| Sensitive data | ❌ No | ✅ Yes |
| Storage format | Plain text | Base64 encoded |
| Used for | Configuration | Credentials |

---

# 6. Inject All Values as Environment Variables

Instead of adding keys individually:

## ConfigMap

```yaml
envFrom:

- configMapRef:

    name: app-config
```

---

## Secret

```yaml
envFrom:

- secretRef:

    name: db-secret
```

This loads all keys automatically.

---

# 7. Mount ConfigMap as Files

Configuration can also be mounted as files.

Example:

```yaml
volumes:

- name: config-volume

  configMap:

    name: app-config
```

Mount:

```yaml
containers:

- name: app

  volumeMounts:

  - name: config-volume

    mountPath: /etc/config
```

Inside the Pod:

```text
/etc/config/APP_ENV

/etc/config/DB_HOST

/etc/config/LOG_LEVEL
```

---

# 8. Why Use Configuration Files?

Many applications expect files instead of environment variables.

Examples:

```text
nginx.conf

app.properties

application.yaml

database.conf
```

---

# 9. Secret Encoding

## Encode Value

Command:

```bash
echo -n 'password123' | base64
```

Output:

```text
cGFzc3dvcmQxMjM=
```

---

## Decode Value

Command:

```bash
echo -n 'cGFzc3dvcmQxMjM=' | base64 -d
```

Output:

```text
password123
```

---

# 10. Kubernetes Secret Types

| Type | Usage |
|---|---|
| Opaque | Generic secrets |
| kubernetes.io/dockerconfigjson | Docker registry login |
| kubernetes.io/tls | SSL/TLS certificates |

---

# 11. Security Reality

Important:

```text
Base64 ≠ Encryption
```

Secrets are not completely secure by default.

Anyone with enough cluster permissions can decode them.

---

Production security uses:

- Encryption at rest
- External secret managers
- Vault systems
- Secret rotation

---

# 12. External Secret Systems

Common production tools:

- HashiCorp Vault
- AWS Secrets Manager
- External Secrets Operator

Architecture example:

```text
External Secret Manager

        ↓

Kubernetes Secret

        ↓

Application Pod
```

---

# 13. ConfigMap Use Cases

Common examples:

```text
Feature flags

Environment settings

Service URLs

Logging levels

Application configuration
```

---

# 14. Secret Use Cases

Common examples:

```text
Database passwords

API tokens

SSH keys

TLS certificates

OAuth credentials
```

---

# 15. View ConfigMaps & Secrets

## View ConfigMaps

```bash
kubectl get configmaps
```

Short form:

```bash
kubectl get cm
```

---

## View Secrets

```bash
kubectl get secrets
```

---

## Describe ConfigMap

```bash
kubectl describe configmap app-config
```

---

## Describe Secret

```bash
kubectl describe secret db-secret
```

---

# 16. Common Mistakes

## Hardcoding Values

Bad:

```yaml
env:

  DB_PASSWORD: 12345
```

Problems:

- Security risk
- Difficult maintenance

---

## Forgetting Base64 Encoding

Secret values must be encoded.

---

## Assuming Secrets Are Encrypted

Wrong:

```text
Secret = Encryption
```

Correct:

```text
Secret = Base64 Encoding
```

---

## Using ConfigMap for Sensitive Data

Wrong:

```text
Database password in ConfigMap
```

Correct:

```text
Database password in Secret
```

---

# Interview Questions

## What is ConfigMap?

A Kubernetes resource used to store non-sensitive configuration data.

---

## What is Secret?

A Kubernetes resource used to store sensitive information like passwords, tokens, and certificates.

---

## Difference between ConfigMap and Secret?

| ConfigMap | Secret |
|---|---|
| Plain text | Base64 encoded |
| Non-sensitive | Sensitive data |

---

## How can ConfigMap be used in Pods?

Two ways:

1. Environment variables

```text
env
```

2. Volume mounts

```text
volumeMounts
```

---

## Are Kubernetes Secrets secure?

Not by default.

They require additional security features like:

- Encryption at rest
- External secret managers
- Proper RBAC controls

---

# Summary

- ConfigMaps store application configuration.
- Secrets store sensitive information.
- Both separate configuration from container images.
- ConfigMaps can be injected as environment variables or files.
- Secrets use Base64 encoding, not encryption.
- Production systems use external secret management solutions.
- Never hardcode passwords or API keys inside images.