# 🚀 Helm Tutorial — Lesson 8: ConfigMaps & Secrets in Helm

> Learn how to manage application configuration and sensitive data in Helm using ConfigMaps and Secrets, and inject them into Kubernetes workloads.

---

# 📚 Table of Contents

- [Learning Objectives](#-learning-objectives)
- [ConfigMap vs Secret](#-configmap-vs-secret)
- [Real-World Example](#-real-world-example)
- [ConfigMap Architecture](#-configmap-architecture)
- [Step 1 — Add Configuration Values](#step-1--add-configuration-values)
- [Step 2 — Create a ConfigMap](#step-2--create-a-configmap)
- [Step 3 — Use a ConfigMap in a Deployment](#step-3--use-a-configmap-in-a-deployment)
- [Using Individual Environment Variables](#-using-individual-environment-variables)
- [Mounting a ConfigMap as a Volume](#-mounting-a-configmap-as-a-volume)
- [Understanding Secrets](#-understanding-secrets)
- [Creating a Secret](#-creating-a-secret)
- [`stringData` vs `data`](#-stringdata-vs-data)
- [Using a Secret in a Deployment](#-using-a-secret-in-a-deployment)
- [Using ConfigMap and Secret Together](#-using-configmap-and-secret-together)
- [Generating ConfigMaps with `range`](#-generating-configmaps-with-range)
- [Generating Secrets with `range`](#-generating-secrets-with-range)
- [Production Best Practices](#-production-best-practices)
- [Configuration Flow](#-configuration-flow)
- [Hands-on Lab](#-hands-on-lab)
- [Interview Questions](#-interview-questions)
- [Key Takeaways](#-key-takeaways)

---

# 🎯 Learning Objectives

By the end of this lesson, you will be able to:

- ✅ Understand what ConfigMaps are
- ✅ Understand what Secrets are
- ✅ Differentiate between ConfigMaps and Secrets
- ✅ Create ConfigMaps using Helm
- ✅ Create Secrets using Helm
- ✅ Inject ConfigMaps and Secrets into Pods
- ✅ Mount configuration as environment variables or volumes
- ✅ Follow production best practices

---

# 📖 ConfigMap vs Secret

| ConfigMap | Secret |
|------------|--------|
| Stores non-sensitive data | Stores sensitive data |
| Used for application configuration | Used for passwords, API keys, tokens, certificates |
| Stored as plain text in etcd (unless encryption at rest is enabled) | Stored as Base64-encoded data (Base64 is **not** encryption) |
| Example: Application settings | Example: Database credentials |

> **Important:** Kubernetes Secrets are **Base64-encoded**, not encrypted by default. For stronger security, enable **etcd encryption at rest** and implement proper RBAC and access controls.

---

# 🌍 Real-World Example

Imagine your application connects to a database.

### Development

```text
DB_HOST=mysql-dev
DB_PORT=3306
```

### Production

```text
DB_HOST=mysql-prod
DB_PORT=3306
```

Should you edit the Deployment manifest for every environment?

**No.**

Store environment-specific values in a ConfigMap.

---

# 🏗️ ConfigMap Architecture

```text
values.yaml
      │
      ▼
configmap.yaml
      │
      ▼
ConfigMap
      │
      ▼
Deployment
      │
      ▼
Container
```

---

# Step 1 — Add Configuration Values

Update `values.yaml`:

```yaml
config:
  APP_NAME: ecommerce
  DB_HOST: mysql
  DB_PORT: "3306"
  LOG_LEVEL: info
```

---

# Step 2 — Create a ConfigMap

Create:

```text
templates/configmap.yaml
```

```yaml
apiVersion: v1
kind: ConfigMap

metadata:
  name: {{ include "my-app.fullname" . }}

data:
  APP_NAME: {{ .Values.config.APP_NAME | quote }}
  DB_HOST: {{ .Values.config.DB_HOST | quote }}
  DB_PORT: {{ .Values.config.DB_PORT | quote }}
  LOG_LEVEL: {{ .Values.config.LOG_LEVEL | quote }}
```

Render the chart:

```bash
helm template demo .
```

Rendered output:

```yaml
kind: ConfigMap

data:
  APP_NAME: "ecommerce"
  DB_HOST: "mysql"
  DB_PORT: "3306"
  LOG_LEVEL: "info"
```

---

# Step 3 — Use a ConfigMap in a Deployment

Update `templates/deployment.yaml`:

```yaml
envFrom:
  - configMapRef:
      name: {{ include "my-app.fullname" . }}
```

Every key becomes an environment variable inside the container.

```text
APP_NAME=ecommerce
DB_HOST=mysql
DB_PORT=3306
LOG_LEVEL=info
```

No need to define each variable individually.

---

# 🔹 Using Individual Environment Variables

Instead of importing all values, you can reference specific keys.

```yaml
env:
  - name: DB_HOST
    valueFrom:
      configMapKeyRef:
        name: {{ include "my-app.fullname" . }}
        key: DB_HOST
```

Use this approach when only a few values are required.

---

# 📂 Mounting a ConfigMap as a Volume

Define a volume:

```yaml
volumes:
  - name: config
    configMap:
      name: {{ include "my-app.fullname" . }}
```

Mount it inside the container:

```yaml
volumeMounts:
  - name: config
    mountPath: /etc/config
```

Inside the container:

```text
/etc/config/
├── APP_NAME
├── DB_HOST
└── DB_PORT
```

Each ConfigMap key becomes a separate file.

---

# 🔐 Understanding Secrets

Sensitive information should never be stored in a ConfigMap.

Typical examples include:

- Database passwords
- API tokens
- JWT secrets
- SMTP credentials
- Private keys

---

# 🛠️ Creating a Secret

Update `values.yaml`:

```yaml
secret:
  DB_USERNAME: admin
  DB_PASSWORD: mypassword
```

Create:

```text
templates/secret.yaml
```

```yaml
apiVersion: v1
kind: Secret

metadata:
  name: {{ include "my-app.fullname" . }}

type: Opaque

stringData:
  DB_USERNAME: {{ .Values.secret.DB_USERNAME | quote }}
  DB_PASSWORD: {{ .Values.secret.DB_PASSWORD | quote }}
```

---

# ⚖️ `stringData` vs `data`

### Using `stringData`

```yaml
stringData:
  DB_PASSWORD: mypassword
```

Kubernetes automatically converts the value to Base64 during Secret creation.

---

### Using `data`

```yaml
data:
  DB_PASSWORD: bXlwYXNzd29yZA==
```

You must manually Base64-encode every value.

### Recommendation

For Helm Charts, prefer **`stringData`** because it is easier to read and maintain.

---

# 🔑 Using a Secret in a Deployment

Import all Secret values:

```yaml
envFrom:
  - secretRef:
      name: {{ include "my-app.fullname" . }}
```

The container receives:

```text
DB_USERNAME=admin
DB_PASSWORD=mypassword
```

---

## Importing Individual Secret Values

```yaml
env:
  - name: DB_PASSWORD
    valueFrom:
      secretKeyRef:
        name: {{ include "my-app.fullname" . }}
        key: DB_PASSWORD
```

Use this approach when only specific secret values are required.

---

# 🔄 Using ConfigMap and Secret Together

A Deployment can consume both resources simultaneously.

```yaml
envFrom:
  - configMapRef:
      name: {{ include "my-app.fullname" . }}

  - secretRef:
      name: {{ include "my-app.fullname" . }}
```

The application receives:

```text
APP_NAME
DB_HOST
LOG_LEVEL
DB_USERNAME
DB_PASSWORD
```

This pattern is extremely common in production environments.

---

# 🔁 Generating ConfigMaps with `range`

Instead of manually defining every key:

### `values.yaml`

```yaml
config:
  APP_NAME: ecommerce
  LOG_LEVEL: debug
  CACHE: redis
```

Template:

```yaml
apiVersion: v1
kind: ConfigMap

metadata:
  name: {{ include "my-app.fullname" . }}

data:
{{- range $key, $value := .Values.config }}
  {{ $key }}: {{ $value | quote }}
{{- end }}
```

Rendered output:

```yaml
data:
  APP_NAME: "ecommerce"
  LOG_LEVEL: "debug"
  CACHE: "redis"
```

This approach is cleaner and easier to maintain.

---

# 🔁 Generating Secrets with `range`

The same pattern applies to Secrets.

```yaml
stringData:
{{- range $key, $value := .Values.secret }}
  {{ $key }}: {{ $value | quote }}
{{- end }}
```

No repetitive code is required.

---

# ✅ Production Best Practices

### Store in ConfigMaps

- Application configuration
- URLs
- Ports
- Feature flags
- Log levels

---

### Store in Secrets

- Passwords
- API keys
- Access tokens
- Certificates
- Private keys

---

### Never Do This

Avoid committing production credentials directly into Git repositories.

```yaml
secret:
  password: mypassword
```

Instead, use:

- External Secret Management tools
- CI/CD Secret Injection
- Environment-specific Secret values
- Kubernetes Secret management solutions

---

# 🔄 Configuration Flow

```text
values.yaml
│
├── config
│      │
│      ▼
│   ConfigMap
│
└── secret
       │
       ▼
     Secret
       │
       ▼
   Deployment
       │
       ▼
    Container
```

---

# 🧪 Hands-on Lab

Update `values.yaml`:

```yaml
config:
  APP_NAME: ecommerce
  LOG_LEVEL: debug

secret:
  DB_USERNAME: admin
  DB_PASSWORD: password123
```

Create:

```text
templates/configmap.yaml
```

Create:

```text
templates/secret.yaml
```

Update `deployment.yaml`:

```yaml
envFrom:
  - configMapRef:
      name: {{ include "my-app.fullname" . }}

  - secretRef:
      name: {{ include "my-app.fullname" . }}
```

Preview the rendered manifests:

```bash
helm template demo .
```

Verify:

- ✅ A ConfigMap is generated.
- ✅ A Secret is generated.
- ✅ The Deployment references both resources.

---

# 🎯 Interview Questions

### 1. What is the difference between a ConfigMap and a Secret?

> A ConfigMap stores non-sensitive configuration, while a Secret stores sensitive information such as passwords, API keys, and tokens.

---

### 2. Is a Kubernetes Secret encrypted?

> No. By default, Kubernetes Secrets are only Base64-encoded. To protect sensitive data, enable **etcd encryption at rest** and apply appropriate access controls.

---

### 3. Why use `stringData`?

> `stringData` allows you to write plain text values, and Kubernetes automatically converts them into Base64-encoded data during Secret creation.

---

### 4. What is the difference between `env` and `envFrom`?

| `env` | `envFrom` |
|--------|-----------|
| Imports specific keys | Imports all keys from a ConfigMap or Secret |
| Suitable for a few variables | Suitable when most or all values are needed |

---

### 5. How can ConfigMaps be consumed by a Pod?

A ConfigMap can be consumed:

- As environment variables
- As mounted files using volumes

---

# 📌 Key Takeaways

- ConfigMaps store non-sensitive configuration, while Secrets store sensitive data.
- Use `values.yaml` to define environment-specific configuration and secrets.
- `envFrom` imports all ConfigMap or Secret values as environment variables.
- ConfigMaps and Secrets can also be mounted as volumes.
- `stringData` simplifies Secret creation by avoiding manual Base64 encoding.
- Using `range` makes ConfigMap and Secret templates cleaner and more maintainable.
- Never store production secrets directly in Git repositories.