# 🚀 Helm Tutorial — Lesson 9: Multi-Environment Deployments

> Learn how to deploy the same Helm Chart across Development, Staging, and Production using environment-specific configuration files and industry best practices.

---

# 📚 Table of Contents

- [Learning Objectives](#-learning-objectives)
- [Why Multiple Environments?](#-why-multiple-environments)
- [Environment Configuration Example](#-environment-configuration-example)
- [Project Folder Structure](#-project-folder-structure)
- [Base Configuration](#-base-configuration)
- [Development Configuration](#-development-configuration)
- [Staging Configuration](#-staging-configuration)
- [Production Configuration](#-production-configuration)
- [Deploying to Different Environments](#-deploying-to-different-environments)
- [Release Naming Strategy](#-release-naming-strategy)
- [Namespace Strategy](#-namespace-strategy)
- [Understanding Values Merging](#-understanding-values-merging)
- [Using Multiple Override Files](#-using-multiple-override-files)
- [Using `--set`](#-using---set)
- [Enterprise Project Structure](#-enterprise-project-structure)
- [Real Deployment Example](#-real-deployment-example)
- [Environment Comparison](#-environment-comparison)
- [Best Practices](#-best-practices)
- [Hands-on Lab](#-hands-on-lab)
- [Mini Challenge](#-mini-challenge)
- [Interview Questions](#-interview-questions)
- [Key Takeaways](#-key-takeaways)

---

# 🎯 Learning Objectives

By the end of this lesson, you will be able to:

- ✅ Understand why multiple environments are required
- ✅ Use environment-specific values files
- ✅ Follow proper release naming conventions
- ✅ Deploy applications into separate namespaces
- ✅ Understand values file merging
- ✅ Apply environment overrides
- ✅ Follow production deployment best practices

---

# 🌍 Why Multiple Environments?

A typical software development lifecycle looks like this:

```text
Developer
    │
    ▼
Development
    │
    ▼
Testing
    │
    ▼
Staging
    │
    ▼
Production
```

Each environment serves a different purpose and requires different configuration.

---

# 📋 Environment Configuration Example

Suppose you're deploying an **e-commerce application**.

### Development

```yaml
replicaCount: 1

image:
  tag: dev

service:
  type: ClusterIP

resources:
  requests:
    cpu: 100m
    memory: 128Mi
```

---

### Staging

```yaml
replicaCount: 2

image:
  tag: release-candidate

service:
  type: ClusterIP

resources:
  requests:
    cpu: 300m
    memory: 512Mi
```

---

### Production

```yaml
replicaCount: 10

image:
  tag: "2.5.1"

service:
  type: LoadBalancer

resources:
  requests:
    cpu: "1"
    memory: 2Gi
```

Notice:

- ✅ Same application
- ✅ Same Helm templates
- ✅ Different configuration

---

# 📁 Project Folder Structure

A common Helm project layout:

```text
my-app/
├── Chart.yaml
├── values.yaml
├── values-dev.yaml
├── values-stage.yaml
├── values-prod.yaml
└── templates/
```

---

# 📄 Base Configuration

`values.yaml` contains settings shared across all environments.

Example:

```yaml
image:
  repository: nginx

service:
  port: 80

config:
  APP_NAME: ecommerce
```

These values rarely change.

---

# 🛠️ Development Configuration

`values-dev.yaml`

```yaml
replicaCount: 1

image:
  tag: dev

config:
  LOG_LEVEL: debug
```

---

# 🧪 Staging Configuration

`values-stage.yaml`

```yaml
replicaCount: 3

image:
  tag: rc

config:
  LOG_LEVEL: info
```

---

# 🚀 Production Configuration

`values-prod.yaml`

```yaml
replicaCount: 8

image:
  tag: "2.5.1"

service:
  type: LoadBalancer

config:
  LOG_LEVEL: warn
```

---

# 🚀 Deploying to Different Environments

## Development

```bash
helm install ecommerce-dev . \
    -f values-dev.yaml
```

Helm processes:

```text
values.yaml
      │
      ▼
values-dev.yaml
      │
      ▼
Merged Values
```

---

## Staging

```bash
helm install ecommerce-stage . \
    -f values-stage.yaml
```

---

## Production

```bash
helm install ecommerce-prod . \
    -f values-prod.yaml
```

Notice:

- Different release names
- Same Helm Chart
- Different configurations

---

# 🏷️ Release Naming Strategy

### ❌ Bad

```text
my-app
```

### ✅ Good

```text
frontend-dev
frontend-stage
frontend-prod
```

or

```text
backend-dev
backend-stage
backend-prod
```

Meaningful release names make environments easy to identify and manage.

---

# 📦 Namespace Strategy

Avoid deploying everything into the default namespace.

### ❌ Default

```text
default
```

### ✅ Recommended

```text
development
staging
production
```

Create namespaces:

```bash
kubectl create namespace development

kubectl create namespace staging

kubectl create namespace production
```

Deploy to Development:

```bash
helm install ecommerce-dev . \
    -f values-dev.yaml \
    -n development
```

Deploy to Production:

```bash
helm install ecommerce-prod . \
    -f values-prod.yaml \
    -n production
```

Each environment is now isolated.

---

# 🔄 Understanding Values Merging

Suppose the base configuration contains:

```yaml
replicaCount: 2

image:
  repository: nginx
  tag: latest

service:
  type: ClusterIP
```

Production overrides:

```yaml
replicaCount: 8

image:
  tag: "1.27"
```

Final merged configuration:

```yaml
replicaCount: 8

image:
  repository: nginx
  tag: "1.27"

service:
  type: ClusterIP
```

Only the overridden values change.

---

# 📚 Using Multiple Override Files

Example:

```text
values.yaml
values-common.yaml
values-prod.yaml
```

Deploy:

```bash
helm install ecommerce . \
    -f values-common.yaml \
    -f values-prod.yaml
```

Helm processes files from left to right.

If the same key exists multiple times, **the last file wins**.

Example:

### `values-common.yaml`

```yaml
replicaCount: 3
```

### `values-prod.yaml`

```yaml
replicaCount: 10
```

Final result:

```yaml
replicas: 10
```

---

# ⚙️ Using `--set`

Temporary overrides can be applied from the command line.

Example:

```bash
helm install ecommerce . \
    -f values-prod.yaml \
    --set image.tag=2.6.0
```

Final image tag:

```text
2.6.0
```

`--set` always has the highest priority.

---

# 🏢 Enterprise Project Structure

Many organizations separate Helm Charts from environment configuration.

```text
helm/
├── charts/
│     └── ecommerce/
│
├── values/
│     ├── dev.yaml
│     ├── stage.yaml
│     └── prod.yaml
│
└── scripts/
```

This structure keeps deployments organized and easier to maintain.

---

# 🌐 Real Deployment Example

### Development

```bash
helm install ecommerce-dev ./charts/ecommerce \
    -f values/dev.yaml \
    -n development
```

---

### Staging

```bash
helm install ecommerce-stage ./charts/ecommerce \
    -f values/stage.yaml \
    -n staging
```

---

### Production

```bash
helm install ecommerce-prod ./charts/ecommerce \
    -f values/prod.yaml \
    -n production
```

One chart.

Three environments.

---

# 📊 Environment Comparison

| Setting | Development | Staging | Production |
|----------|-------------|----------|------------|
| Replicas | 1 | 3 | 10 |
| Image Tag | `dev` | `rc` | `2.5.1` |
| Service | ClusterIP | ClusterIP | LoadBalancer |
| Log Level | `debug` | `info` | `warn` |
| Namespace | development | staging | production |

---

# ✅ Best Practices

### Keep Common Values in `values.yaml`

Example:

```yaml
image:
  repository: nginx

service:
  port: 80
```

---

### Override Only What's Different

### ❌ Bad

`values-prod.yaml` contains every configuration value.

### ✅ Good

```yaml
replicaCount: 10

image:
  tag: "2.5.1"
```

Only include environment-specific differences.

---

### Use Separate Namespaces

Avoid deploying multiple environments into the same namespace.

---

### Use Meaningful Release Names

Examples:

```text
frontend-prod
backend-prod
payments-prod
```

Avoid generic names such as:

```text
app
demo
test
```

---

### Store Values Files in Git

Version-control your environment configuration.

> **Exception:** Never store production secrets in plain text. Use external secret management solutions or encrypted secret workflows.

---

# 🧪 Hands-on Lab

Create the following files.

### `values-dev.yaml`

```yaml
replicaCount: 1

image:
  tag: dev

config:
  LOG_LEVEL: debug
```

---

### `values-stage.yaml`

```yaml
replicaCount: 3

image:
  tag: rc

config:
  LOG_LEVEL: info
```

---

### `values-prod.yaml`

```yaml
replicaCount: 8

image:
  tag: "2.5.1"

service:
  type: LoadBalancer

config:
  LOG_LEVEL: warn
```

Render each environment.

### Development

```bash
helm template ecommerce-dev . \
    -f values-dev.yaml
```

---

### Staging

```bash
helm template ecommerce-stage . \
    -f values-stage.yaml
```

---

### Production

```bash
helm template ecommerce-prod . \
    -f values-prod.yaml
```

Compare the generated manifests.

---

# 🎯 Mini Challenge

Assume you need to deploy image version **2.6.0** only to Production.

Without modifying `values-prod.yaml`, run:

```bash
helm template ecommerce-prod . \
    -f values-prod.yaml \
    --set image.tag=2.6.0
```

Verify:

- ✅ Image tag is `2.6.0`
- ✅ All other production settings remain unchanged

---

# 🎤 Interview Questions

### 1. Why do we use multiple values files?

> Multiple values files allow the same Helm Chart to be deployed across different environments using environment-specific configurations.

---

### 2. What is the benefit of separate namespaces?

> Separate namespaces isolate resources, reduce conflicts, simplify access control, and make environment management easier.

---

### 3. What happens when multiple values files define the same key?

> Helm processes values files from left to right, and the value from the **last file** overrides earlier values.

---

### 4. Which has higher priority: `-f` or `--set`?

> `--set` always has the highest priority.

---

### 5. Should each environment have its own Helm Chart?

> No. The recommended approach is to maintain a single reusable Helm Chart and use different values files for each environment.

---

# 📌 Key Takeaways

- A single Helm Chart can support Development, Staging, and Production environments.
- Environment-specific configuration is managed through dedicated values files.
- Common configuration belongs in `values.yaml`, while environment-specific differences belong in override files.
- Helm merges values files, with later files overriding earlier ones.
- `--set` provides the highest-priority override for temporary changes.
- Use meaningful release names and dedicated namespaces for better organization.
- Store configuration in version control, but keep production secrets out of Git.