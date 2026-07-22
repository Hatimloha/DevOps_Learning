# 🚀 Helm Tutorial — Lesson 2: Helm Chart Structure

> Learn how a Helm Chart is organized, the purpose of each file, and how Helm converts templates into Kubernetes manifests.

---

## 📚 Table of Contents

- [Learning Objectives](#-learning-objectives)
- [Helm Chart Overview](#-helm-chart-overview)
- [Create Your First Chart](#-create-your-first-chart)
- [Helm Chart Directory Structure](#-helm-chart-directory-structure)
- [Chart.yaml](#1-chartyaml)
- [values.yaml](#2-valuesyaml)
- [templates/](#3-templates)
- [charts/](#4-charts)
- [_helpers.tpl](#5-helperstpl)
- [NOTES.txt](#6-notestxt)
- [tests/](#7-tests)
- [.helmignore](#8-helmignore)
- [How Helm Renders Templates](#-how-helm-renders-templates)
- [Typical Workflow](#-typical-workflow)
- [Best Practices](#-best-practices)
- [Interview Questions](#-interview-questions)
- [Key Takeaways](#-key-takeaways)

---

# 🎯 Learning Objectives

By the end of this lesson, you will be able to:

- ✅ Understand the structure of a Helm Chart
- ✅ Know the purpose of every important file
- ✅ Identify which files are edited most frequently
- ✅ Understand how Helm renders Kubernetes manifests

---

# 📦 Helm Chart Overview

A Helm Chart packages all Kubernetes resources required for an application into a single reusable package.

```text
Application
    │
    ▼
 Helm Chart
    │
    ├── Deployment
    ├── Service
    ├── ConfigMap
    ├── Secret
    ├── Ingress
    └── HPA
```

Instead of maintaining dozens of separate YAML files, Helm bundles them into one chart that can be deployed with a single command.

---

# 🛠️ Create Your First Chart

Generate a new Helm Chart:

```bash
helm create my-app
```

Helm creates the following directory structure:

```text
my-app/
├── Chart.yaml
├── values.yaml
├── charts/
├── templates/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   ├── serviceaccount.yaml
│   ├── hpa.yaml
│   ├── NOTES.txt
│   ├── _helpers.tpl
│   └── tests/
│       └── test-connection.yaml
└── .helmignore
```

This starter chart provides a complete template for building Kubernetes applications.

---

# 📂 Helm Chart Directory Structure

```text
my-app/
│
├── Chart.yaml        ← Chart metadata
├── values.yaml       ← Default configuration values
├── templates/        ← Kubernetes resource templates
├── charts/           ← Dependency charts
└── .helmignore       ← Files ignored during packaging
```

These five components form the foundation of nearly every Helm Chart.

---

# 1️⃣ Chart.yaml

The `Chart.yaml` file contains metadata about your Helm Chart.

### Example

```yaml
apiVersion: v2
name: my-app
description: My first Helm chart
type: application
version: 0.1.0
appVersion: "1.0.0"
```

## Important Fields

| Field | Description |
|--------|-------------|
| `apiVersion` | Helm chart specification version (`v2` for Helm 3) |
| `name` | Name of the chart |
| `description` | Human-readable description |
| `type` | `application` or `library` |
| `version` | Version of the Helm Chart |
| `appVersion` | Version of the application being deployed |

### Chart Types

```yaml
type: application
```

Deployable Helm Chart.

```yaml
type: library
```

Reusable templates without deployable resources.

> **Note:** Most Helm Charts use `application`.

---

## 📌 Chart Version vs Application Version

These versions are independent.

```text
Chart
│
├── version      → Helm package version
│
└── appVersion   → Application version
```

### Example

```text
Chart Version: 2.1.0

Deploys

Nginx Version: 1.27
```

Updating your application does not necessarily require changing the chart version, and vice versa.

---

# 2️⃣ values.yaml

The `values.yaml` file contains the default configuration used by your templates.

### Example

```yaml
replicaCount: 2

image:
  repository: nginx
  tag: latest

service:
  type: ClusterIP
  port: 80
```

Instead of hardcoding values in templates, Helm retrieves them from this file.

---

## Why Use values.yaml?

### Without Helm

```yaml
replicas: 3
```

Need five replicas?

You must edit the YAML file manually.

---

### With Helm

```yaml
replicaCount: 5
```

No template modifications are required.

---

## Example

### Template

```yaml
replicas: {{ .Values.replicaCount }}
```

### values.yaml

```yaml
replicaCount: 4
```

### Rendered Manifest

```yaml
replicas: 4
```

This separation makes Helm Charts flexible and reusable.

---

# 3️⃣ templates/

The `templates/` directory contains Kubernetes resource templates.

```text
templates/
│
├── deployment.yaml
├── service.yaml
├── ingress.yaml
├── configmap.yaml
├── secret.yaml
└── hpa.yaml
```

These are **templates**, not final Kubernetes manifests.

### Example

```yaml
metadata:
  name: {{ .Release.Name }}
```

Helm replaces placeholders with actual values during installation.

---

# 🔄 How Helm Renders Templates

```text
values.yaml
      │
      ▼
Template Files
      │
      ▼
Rendered Kubernetes YAML
      │
      ▼
Kubernetes API
```

Helm combines template files with values to generate valid Kubernetes manifests.

---

# 4️⃣ charts/

The `charts/` directory stores dependency charts.

Example:

```text
charts/
├── redis/
├── mysql/
└── prometheus/
```

If your application depends on Redis or MySQL, they can be packaged as dependencies instead of being installed separately.

> Dependency management will be covered in a later lesson.

---

# 5️⃣ _helpers.tpl

The `_helpers.tpl` file contains reusable template functions.

Instead of repeating code:

```yaml
name: my-app
```

Define it once:

```gotemplate
{{ define "my-app.name" }}
my-app
{{ end }}
```

Reuse it anywhere:

```gotemplate
{{ include "my-app.name" . }}
```

### Benefits

- Less duplication
- Easier maintenance
- Consistent naming
- Cleaner templates

---

# 6️⃣ NOTES.txt

`NOTES.txt` displays useful information after a chart is installed.

Example:

```text
Your application has been deployed successfully.

Access it using:

kubectl port-forward ...
```

Use it to provide users with post-installation instructions.

---

# 7️⃣ tests/

The `tests/` directory contains Kubernetes resources used for testing deployments.

Example:

```text
tests/
└── test-connection.yaml
```

Run tests using:

```bash
helm test my-app
```

This verifies that the deployed application is functioning correctly.

---

# 8️⃣ .helmignore

Works similarly to `.gitignore`.

Example:

```text
.git/
README.md
*.log
```

Ignored files are excluded when packaging the chart.

---

# 🔗 How Everything Connects

```text
Chart.yaml
     │
     ▼
values.yaml
     │
     ▼
templates/
     │
     ▼
Rendered Kubernetes Manifests
     │
     ▼
Kubernetes Cluster
```

---

# ⚙️ Typical Helm Workflow

Create a new chart:

```bash
helm create my-app
```

Edit chart metadata:

```bash
vim Chart.yaml
```

Configure default values:

```bash
vim values.yaml
```

Customize templates:

```bash
vim templates/deployment.yaml
```

Validate the chart:

```bash
helm lint my-app
```

Preview rendered manifests:

```bash
helm template my-app
```

Install the chart:

```bash
helm install my-release ./my-app
```

---

# ✅ Best Practices

- Keep templates generic and reusable.
- Store environment-specific settings in `values.yaml` or separate values files.
- Use `_helpers.tpl` for reusable names, labels, and helper functions.
- Keep `Chart.yaml` clean and update versions appropriately.
- Run `helm lint` before deployment.
- Use `helm template` to preview generated manifests before installing.

---

# 🎯 Interview Questions

### 1. What is a Helm Chart?

> A packaged Kubernetes application containing templates, configuration values, and metadata.

---

### 2. What is the purpose of `Chart.yaml`?

> It stores metadata such as the chart name, version, description, and application version.

---

### 3. What is the difference between `version` and `appVersion`?

| version | appVersion |
|----------|------------|
| Helm Chart version | Application version |
| Used for packaging | Used for informational purposes |

---

### 4. Why is `values.yaml` important?

> It stores configurable values, allowing templates to remain reusable without hardcoding settings.

---

### 5. What does the `templates/` directory contain?

> Kubernetes resource templates that Helm renders into final YAML manifests.

---

### 6. What is `_helpers.tpl` used for?

> It stores reusable template functions to reduce duplication and improve maintainability.

---

### 7. What is the purpose of the `charts/` directory?

> It contains dependency charts required by the application.

---

### 8. What is the difference between `helm template` and `helm install`?

| Command | Purpose |
|----------|---------|
| `helm template` | Generates Kubernetes manifests locally without deploying them |
| `helm install` | Generates manifests and deploys them to the Kubernetes cluster |

---

# 📌 Key Takeaways

- A Helm Chart packages Kubernetes resources into a reusable application.
- `Chart.yaml` stores chart metadata.
- `values.yaml` contains configurable default values.
- `templates/` holds Kubernetes resource templates.
- `_helpers.tpl` provides reusable template functions.
- `charts/` manages dependencies.
- `helm template` previews rendered manifests, while `helm install` deploys them.
- Understanding the chart structure is essential before creating production-ready Helm Charts.

---