````md id="m21e7q"
# 🚀 Helm Tutorial — Lesson 21: Managing Multiple Environments (Dev, QA, Stage & Production)

> Learn how to deploy the **same Helm Chart** across multiple environments by using separate values files. This approach eliminates duplicate templates, reduces configuration drift, and enables consistent deployments from development to production.

---

# 📚 Table of Contents

- [Learning Objectives](#-learning-objectives)
- [Why Multiple Environments?](#-why-multiple-environments)
- [The Problem Without Helm Values](#-the-problem-without-helm-values)
- [Helm's Environment-Based Approach](#-helms-environment-based-approach)
- [Project Structure](#-project-structure)
- [Base `values.yaml`](#-base-valuesyaml)
- [Development Configuration](#-development-configuration)
- [QA Configuration](#-qa-configuration)
- [Production Configuration](#-production-configuration)
- [Deploying with Environment Values](#-deploying-with-environment-values)
- [Values Override Priority](#-values-override-priority)
- [Using Multiple Values Files](#-using-multiple-values-files)
- [Deployment Template Example](#-deployment-template-example)
- [Environment Variables](#-environment-variables)
- [Database Configuration](#-database-configuration)
- [Image Management](#-image-management)
- [Using Kubernetes Namespaces](#-using-kubernetes-namespaces)
- [Helm Release Naming](#-helm-release-naming)
- [CI/CD Environment Workflow](#-cicd-environment-workflow)
- [Enterprise Repository Structure](#-enterprise-repository-structure)
- [Best Practices](#-best-practices)
- [Common Mistakes](#-common-mistakes)
- [Hands-on Lab](#-hands-on-lab)
- [Summary](#-summary)
- [Interview Questions](#-interview-questions)
- [Key Takeaways](#-key-takeaways)

---

# 🎯 Learning Objectives

By the end of this lesson, you will be able to:

- ✅ Understand environment-based Helm configuration
- ✅ Use multiple values files
- ✅ Understand Helm's values override order
- ✅ Deploy the same chart to Dev, QA, Stage, and Production
- ✅ Build production deployment workflows
- ✅ Apply enterprise best practices for environment management

---

# 🌍 Why Multiple Environments?

Most organizations deploy applications through several environments before reaching production.

Typical deployment flow:

```text
Developer Machine
        │
        ▼
Development
        │
        ▼
QA
        │
        ▼
Staging
        │
        ▼
Production
```

Each environment requires different configuration, including:

- Replica count
- Database connections
- Image tags
- Resource limits
- Domain names
- Secrets
- Debug settings

Helm solves this by separating **configuration** from **templates**.

---

# ❌ The Problem Without Helm Values

Without environment-specific values files, teams often create separate manifests.

Example:

```text
deployment-dev.yaml

deployment-qa.yaml

deployment-prod.yaml
```

Problems:

- ❌ Duplicate YAML
- ❌ Difficult maintenance
- ❌ Configuration drift
- ❌ Higher risk of deployment mistakes

---

# ✅ Helm's Environment-Based Approach

Instead of maintaining multiple templates:

```text
templates/
    deployment.yaml
```

Maintain multiple configuration files:

```text
values-dev.yaml

values-qa.yaml

values-prod.yaml
```

One template supports every environment.

---

# 📁 Project Structure

Example:

```text
application/

├── Chart.yaml
├── values.yaml
├── values-dev.yaml
├── values-qa.yaml
├── values-stage.yaml
├── values-prod.yaml
└── templates/
    └── deployment.yaml
```

The chart templates remain identical while configuration changes per environment.

---

# 📄 Base `values.yaml`

Default configuration shared by all environments.

```yaml
replicaCount: 1

image:
  repository: nginx
  tag: latest

resources:
  limits:
    cpu: 500m
    memory: 512Mi
```

This serves as the baseline configuration.

---

# 💻 Development Configuration

File:

```text
values-dev.yaml
```

Example:

```yaml
replicaCount: 1

image:
  tag: dev

resources:
  limits:
    cpu: 200m
    memory: 256Mi

environment: development
```

Development environments usually prioritize rapid testing over performance.

---

# 🧪 QA Configuration

File:

```text
values-qa.yaml
```

Example:

```yaml
replicaCount: 2

image:
  tag: qa

resources:
  limits:
    cpu: 500m
    memory: 512Mi

environment: qa
```

QA often mirrors production more closely while supporting testing workloads.

---

# 🏭 Production Configuration

File:

```text
values-prod.yaml
```

Example:

```yaml
replicaCount: 5

image:
  tag: v1.0.0

resources:
  limits:
    cpu: 2
    memory: 2Gi

environment: production
```

Production uses stable versions and higher resource allocations.

---

# 🚀 Deploying with Environment Values

## Development

```bash
helm install app . \
    -f values-dev.yaml
```

---

## QA

```bash
helm install app . \
    -f values-qa.yaml
```

---

## Production

```bash
helm install app . \
    -f values-prod.yaml
```

The same Helm Chart is reused across all environments.

---

# 🔄 Values Override Priority

Helm loads values in a specific order.

```text
values.yaml
      │
      ▼
values-prod.yaml
      │
      ▼
--set
```

The **last value wins**.

Example:

`values.yaml`

```yaml
replicaCount: 1
```

`values-prod.yaml`

```yaml
replicaCount: 5
```

Command:

```bash
helm install app . \
    -f values-prod.yaml \
    --set replicaCount=10
```

Final rendered value:

```yaml
replicaCount: 10
```

> **Override Order (highest precedence last):**
>
> 1. Chart `values.yaml`
> 2. Files specified with `-f` (processed left to right)
> 3. `--set`, `--set-string`, and `--set-file`

---

# 📑 Using Multiple Values Files

Helm allows multiple values files.

Example:

```bash
helm install app . \
    -f values.yaml \
    -f values-prod.yaml
```

Processing order:

```text
First File
      │
      ▼
Second File Overrides First
```

This makes it easy to layer configurations, such as:

- Common values
- Regional overrides
- Environment overrides

---

# 📦 Deployment Template Example

`templates/deployment.yaml`

```yaml
apiVersion: apps/v1

kind: Deployment

metadata:

  name: {{ .Release.Name }}

spec:

  replicas: {{ .Values.replicaCount }}

  template:

    spec:

      containers:

      - name: app

        image: {{ .Values.image.repository }}:{{ .Values.image.tag }}
```

The same template works for every environment.

---

# 🌱 Environment Variables

Development:

```yaml
env:

  NODE_ENV: development
```

Production:

```yaml
env:

  NODE_ENV: production
```

Template:

```yaml
env:

- name: NODE_ENV

  value: {{ .Values.env.NODE_ENV }}
```

Only the values change—the template stays identical.

---

# 🗄️ Database Configuration

Development:

```yaml
database:

  host: dev-postgres

  name: devdb
```

Production:

```yaml
database:

  host: prod-postgres

  name: proddb
```

The application uses the appropriate database based on the selected values file.

---

# 🖼️ Image Management

Development:

```yaml
image:

  repository: ecommerce

  tag: develop
```

Production:

```yaml
image:

  repository: ecommerce

  tag: 2.0.1
```

Development may track feature builds, while production should always use immutable image tags.

---

# 📂 Using Kubernetes Namespaces

Deploy each environment into a separate namespace.

Development:

```bash
helm install ecommerce . \
    -n dev
```

Production:

```bash
helm install ecommerce . \
    -n production
```

Example:

```text
dev namespace
      │
      ▼
ecommerce-dev

production namespace
      │
      ▼
ecommerce-prod
```

Using namespaces improves isolation and resource organization.

---

# 🏷️ Helm Release Naming

Development:

```bash
helm install ecommerce-dev .
```

Production:

```bash
helm install ecommerce-prod .
```

View all releases:

```bash
helm list -A
```

Example:

```text
NAME               NAMESPACE

ecommerce-dev      dev

ecommerce-prod     production
```

Each environment is managed independently.

---

# 🔄 CI/CD Environment Workflow

Typical enterprise deployment pipeline:

```text
Git Push
    │
    ▼
Build Container Image
    │
    ▼
Push Image
    │
    ▼
Deploy Development
    │
    ▼
Automated Testing
    │
    ▼
Deploy QA
    │
    ▼
Approval
    │
    ▼
Deploy Staging
    │
    ▼
Production Deployment
```

Each deployment stage uses a different values file.

```text
values-dev.yaml

values-qa.yaml

values-stage.yaml

values-prod.yaml
```

---

# 🏢 Enterprise Repository Structure

A common Git repository layout:

```text
helm-charts/

├── ecommerce/
│
├── values/
│   ├── dev/
│   │   └── values.yaml
│   │
│   ├── qa/
│   │   └── values.yaml
│   │
│   ├── stage/
│   │   └── values.yaml
│   │
│   └── prod/
│       └── values.yaml
```

Separating environment values keeps repositories organized and easier to manage.

---

# ✅ Best Practices

## Keep Templates Identical

Avoid:

```text
deployment-dev.yaml

deployment-prod.yaml
```

Use one template with multiple values files.

---

## Separate Environment Configuration

Store each environment in its own values file.

Example:

```text
values-dev.yaml

values-qa.yaml

values-stage.yaml

values-prod.yaml
```

---

## Pin Production Image Versions

Good:

```yaml
image:
  tag: v1.5.2
```

Avoid:

```yaml
tag: latest
```

Immutable image versions provide predictable deployments.

---

## Protect Sensitive Data

Never store:

- Passwords
- API Keys
- Tokens
- Certificates

inside Git-managed values files.

Use solutions such as:

- External Secrets Operator
- HashiCorp Vault
- Mozilla SOPS
- Cloud secret managers

---

## Validate Before Deployment

Always verify rendered manifests:

```bash
helm template

helm lint

helm install --dry-run --debug
```

before deploying to production.

---

# ❌ Common Mistakes

## Creating Separate Templates

Avoid:

```text
deployment-prod.yaml

deployment-dev.yaml
```

Maintain one template instead.

---

## Using `latest` Images

Incorrect:

```yaml
image:
  tag: latest
```

Use versioned image tags for production.

---

## Incorrect Values File Order

Example:

```bash
-f values-prod.yaml \
-f values-dev.yaml
```

Development values override production values.

Always verify file order carefully.

---

## Storing Secrets in Values Files

Avoid:

```yaml
password: admin123
```

Use dedicated secret management solutions.

---

# 🧪 Hands-on Lab

Create:

```text
values-dev.yaml

values-prod.yaml
```

Development:

```yaml
replicaCount: 1

image:
  tag: dev
```

Production:

```yaml
replicaCount: 5

image:
  tag: v1.0.0
```

Render Development:

```bash
helm template app . \
    -f values-dev.yaml
```

Render Production:

```bash
helm template app . \
    -f values-prod.yaml
```

Compare:

- Replica count
- Image tag
- Resource limits

Observe how the same templates generate different manifests.

---

# 📋 Summary

| Concept | Purpose |
|----------|---------|
| `values-dev.yaml` | Development configuration |
| `values-qa.yaml` | QA configuration |
| `values-stage.yaml` | Staging configuration |
| `values-prod.yaml` | Production configuration |
| `-f` | Load custom values files |
| `--set` | Temporarily override values |
| Kubernetes Namespace | Separate environments |
| Shared Templates | Avoid duplication across environments |

---

# 🎤 Interview Questions

### 1. How do you manage multiple environments with Helm?

> By using separate values files (such as `values-dev.yaml`, `values-qa.yaml`, and `values-prod.yaml`) while reusing the same chart templates.

---

### 2. Which value wins if multiple files define the same key?

> The last loaded value overrides previously defined values. Values supplied with `--set` have the highest precedence.

---

### 3. Why use different values files?

> They separate environment-specific configuration while allowing a single Helm Chart to be reused across all environments.

---

### 4. Should production use the `latest` Docker image?

> No. Production should always use immutable, versioned image tags for predictable and repeatable deployments.

---

### 5. Where should secrets be stored?

> Outside Helm values files, using secret management solutions such as HashiCorp Vault, Mozilla SOPS, External Secrets Operator, or cloud-native secret managers.

---

# 📌 Key Takeaways

- Helm enables multiple environments by combining one set of templates with multiple values files.
- Environment-specific configuration belongs in dedicated values files, not separate templates.
- Helm processes values in order, with later files overriding earlier ones and `--set` taking highest precedence.
- Deploy each environment into its own Kubernetes namespace and use distinct Helm release names.
- CI/CD pipelines typically deploy the same chart through Dev, QA, Stage, and Production using different values files.
- Use immutable image tags and external secret management for secure, predictable production deployments.