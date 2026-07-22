````md id="o17v6r"
# 🚀 Helm Tutorial — Lesson 17: OCI Registry Support

> Learn how to store, distribute, and deploy Helm Charts using **OCI (Open Container Initiative) registries**. Modern DevOps teams increasingly use OCI registries instead of traditional Helm repositories because they provide better authentication, simplified management, and seamless integration with container workflows.

---

# 📚 Table of Contents

- [Learning Objectives](#-learning-objectives)
- [What is OCI?](#-what-is-oci)
- [Traditional Helm Repository vs OCI](#-traditional-helm-repository-vs-oci)
- [Supported OCI Registries](#-supported-oci-registries)
- [OCI URL Format](#-oci-url-format)
- [Logging in to an OCI Registry](#-logging-in-to-an-oci-registry)
- [Packaging a Chart](#-packaging-a-chart)
- [Pushing Charts to an OCI Registry](#-pushing-charts-to-an-oci-registry)
- [Pulling Charts](#-pulling-charts)
- [Installing Charts from OCI](#-installing-charts-from-oci)
- [Upgrading Releases from OCI](#-upgrading-releases-from-oci)
- [OCI Registry Layout](#-oci-registry-layout)
- [OCI vs Helm Repository](#-oci-vs-helm-repository)
- [Why OCI?](#-why-oci)
- [CI/CD Workflow](#-cicd-workflow)
- [Managing Images and Charts Together](#-managing-images-and-charts-together)
- [Version Management](#-version-management)
- [Authentication](#-authentication)
- [Best Practices](#-best-practices)
- [Common Mistakes](#-common-mistakes)
- [Hands-on Lab](#-hands-on-lab)
- [Summary](#-summary)
- [Interview Questions](#-interview-questions)
- [Key Takeaways](#-key-takeaways)

---

# 🎯 Learning Objectives

By the end of this lesson, you will be able to:

- ✅ Understand what OCI is
- ✅ Learn the Helm OCI workflow
- ✅ Authenticate with OCI registries
- ✅ Push and pull Helm Charts
- ✅ Install Helm Charts directly from OCI registries
- ✅ Compare OCI registries with traditional Helm repositories
- ✅ Apply OCI best practices in enterprise environments

---

# 🌍 What is OCI?

**OCI** stands for:

> **Open Container Initiative**

OCI defines open standards for storing and distributing container-related artifacts.

Originally, OCI registries were designed to store:

```text
Docker Image
      │
      ▼
OCI Registry
```

Today, Helm also supports storing charts in OCI registries.

This allows organizations to manage **container images and Helm Charts in the same registry**.

---

# 🔄 Traditional Helm Repository vs OCI

## Traditional Helm Repository

```text
Developer
     │
     ▼
helm package
     │
     ▼
index.yaml
     │
     ▼
HTTP Server
     │
     ▼
helm repo add
     │
     ▼
helm install
```

---

## OCI Workflow

```text
Developer
     │
     ▼
helm package
     │
     ▼
OCI Registry
     │
     ▼
helm pull
     │
     ▼
helm install
```

Unlike traditional repositories, OCI **does not require an `index.yaml` file**.

---

# 📦 Supported OCI Registries

| Registry | OCI Support |
|-----------|-------------|
| Docker Hub | ✅ |
| GitHub Container Registry (GHCR) | ✅ |
| Amazon Elastic Container Registry (ECR) | ✅ |
| Google Artifact Registry (GAR) | ✅ |
| Azure Container Registry (ACR) | ✅ |

Most modern container registries support storing Helm Charts.

---

# 🔗 OCI URL Format

OCI charts use the following format:

```text
oci://registry/repository/chart
```

Example:

```text
oci://ghcr.io/company/charts/ecommerce
```

Unlike Helm repositories, OCI URLs always begin with:

```text
oci://
```

---

# 🔐 Logging in to an OCI Registry

Authenticate before pushing or pulling private charts.

Example:

```bash
helm registry login ghcr.io
```

Helm prompts for:

- Username
- Password or Personal Access Token (PAT)

Example for Docker Hub:

```bash
helm registry login registry-1.docker.io
```

---

# 📦 Packaging a Chart

Before uploading a chart, package it.

```bash
helm package .
```

Example output:

```text
ecommerce-0.1.0.tgz
```

OCI registries store packaged chart archives—not chart directories.

---

# ⬆️ Pushing Charts to an OCI Registry

Upload a packaged chart:

```bash
helm push ecommerce-0.1.0.tgz \
    oci://ghcr.io/company/charts
```

Workflow:

```text
Package Chart
      │
      ▼
Push Chart
      │
      ▼
Stored in OCI Registry
```

The registry now contains a versioned Helm Chart.

---

# ⬇️ Pulling Charts

Download a packaged chart:

```bash
helm pull \
    oci://ghcr.io/company/charts/ecommerce
```

Result:

```text
ecommerce-0.1.0.tgz
```

This downloads the chart without installing it.

---

# 🚀 Installing Charts from OCI

Helm can install directly from an OCI registry.

```bash
helm install ecommerce \
    oci://ghcr.io/company/charts/ecommerce
```

Workflow:

```text
OCI Registry
      │
      ▼
Download Chart
      │
      ▼
Install Release
```

No manual `helm pull` is required.

---

## Install a Specific Version

```bash
helm install ecommerce \
    oci://ghcr.io/company/charts/ecommerce \
    --version 1.2.0
```

Version pinning is recommended for production deployments.

---

# ⬆️ Upgrading Releases from OCI

Upgrade an existing release:

```bash
helm upgrade ecommerce \
    oci://ghcr.io/company/charts/ecommerce
```

Helm retrieves the chart from the OCI registry and upgrades the release.

---

# 📂 OCI Registry Layout

Example repository structure:

```text
ghcr.io/

└── company/
      └── charts/
            ├── ecommerce
            ├── backend
            ├── frontend
            └── monitoring
```

Each chart can have multiple published versions.

---

# ⚖️ OCI vs Helm Repository

| Feature | Helm Repository | OCI Registry |
|----------|-----------------|--------------|
| `index.yaml` | ✅ Required | ❌ Not Required |
| HTTP Hosting | ✅ Required | ❌ Not Required |
| Docker Registry | ❌ | ✅ |
| Authentication | Basic HTTP Authentication | Native Registry Authentication |
| Modern Standard | Older Approach | ✅ Recommended |

---

# 🌟 Why OCI?

OCI registries provide several advantages.

### Benefits

- Uses existing container registries
- Strong authentication mechanisms
- No repository index to maintain
- Better CI/CD integration
- Easier permission management
- Store images and Helm Charts together
- Enterprise-friendly artifact management

---

# 🔄 CI/CD Workflow

A typical OCI deployment pipeline:

```text
Developer
     │
     ▼
Git Push
     │
     ▼
CI Pipeline
     │
     ▼
helm lint
     │
     ▼
helm package
     │
     ▼
helm push
     │
     ▼
OCI Registry
     │
     ▼
Production Deployment
```

This creates an automated and repeatable deployment process.

---

# 📦 Managing Images and Charts Together

OCI allows Docker images and Helm Charts to coexist.

Example:

```text
Docker Hub

├── backend:2.0
├── frontend:2.0
└── ecommerce-chart:1.3.0
```

This simplifies artifact management and version tracking.

---

# 🔖 Version Management

An OCI registry can store multiple versions of the same chart.

Example:

```text
ecommerce

├── 1.0.0
├── 1.1.0
└── 1.2.0
```

Install a specific version:

```bash
helm install app \
    oci://registry/charts/ecommerce \
    --version 1.1.0
```

Avoid overwriting existing versions.

---

# 🔑 Authentication

## Public Registries

Some public registries allow anonymous read access.

```text
Read
  │
  ▼
Anonymous Access (where supported)
```

---

## Private Registries

Private registries require authentication.

```text
Login
   │
   ▼
Access Token
   │
   ▼
Push / Pull Charts
```

Examples include:

- GitHub Personal Access Tokens (PATs)
- AWS IAM authentication
- Azure credentials
- Google Cloud authentication

---

# ✅ Best Practices

## Package Before Pushing

Always validate and package the chart first.

```bash
helm lint .

helm package .

helm push ...
```

---

## Keep Chart and Application Versions Separate

Example:

```yaml
version: 1.2.0

appVersion: "2.5.1"
```

- `version` → Helm Chart version
- `appVersion` → Application version

---

## Use Private Registries

For internal applications, prefer:

- GitHub Container Registry (GHCR)
- Amazon ECR
- Azure Container Registry (ACR)
- Google Artifact Registry (GAR)

---

## Version Every Release

Never overwrite an existing chart version.

Publish a new version for every release.

---

## Integrate OCI into CI/CD

Recommended deployment flow:

```text
Build
   │
   ▼
Test
   │
   ▼
helm package
   │
   ▼
helm push
   │
   ▼
Deploy
```

---

# ❌ Common Mistakes

## Forgetting to Authenticate

Incorrect:

```bash
helm push ...
```

Result:

```text
Unauthorized
```

Correct:

```bash
helm registry login
```

---

## Pushing Without Packaging

Incorrect:

```bash
helm push .
```

Correct:

```bash
helm package .

helm push ecommerce-0.1.0.tgz ...
```

---

## Reusing Chart Versions

Do not publish different chart contents using the same chart version.

Always increment the chart version before pushing.

---

## Using the Wrong URL Scheme

Incorrect:

```text
https://ghcr.io/company/charts
```

Correct:

```text
oci://ghcr.io/company/charts
```

---

# 🧪 Hands-on Lab

> **Prerequisite:** Access to an OCI-compatible registry such as Docker Hub, GHCR, Amazon ECR, Azure Container Registry, or Google Artifact Registry.

### Step 1 — Validate and Package

```bash
helm lint .

helm package .
```

---

### Step 2 — Login

Example:

```bash
helm registry login ghcr.io
```

---

### Step 3 — Push the Chart

```bash
helm push ecommerce-0.1.0.tgz \
    oci://ghcr.io/<username>/charts
```

---

### Step 4 — Pull the Chart

```bash
helm pull \
    oci://ghcr.io/<username>/charts/ecommerce
```

---

### Step 5 — Install the Chart

```bash
helm install ecommerce \
    oci://ghcr.io/<username>/charts/ecommerce
```

---

# 📋 Summary

| Command | Purpose |
|----------|---------|
| `helm registry login` | Authenticate with an OCI registry |
| `helm package` | Package a Helm Chart |
| `helm push` | Upload a packaged chart to an OCI registry |
| `helm pull` | Download a chart from an OCI registry |
| `helm install oci://...` | Install a chart directly from an OCI registry |

---

# 🎤 Interview Questions

### 1. What is OCI?

> OCI (Open Container Initiative) is an open standard for storing and distributing container-related artifacts, including Docker images and Helm Charts.

---

### 2. What is the main advantage of OCI over traditional Helm repositories?

> OCI stores Helm Charts in container registries and does not require an `index.yaml` file, making repository management simpler and leveraging existing registry infrastructure.

---

### 3. Which command logs in to an OCI registry?

```bash
helm registry login <registry>
```

---

### 4. Can Docker images and Helm Charts share the same registry?

> Yes. OCI registries can store both container images and Helm Charts together.

---

### 5. What URL scheme is used for OCI charts?

```text
oci://
```

---

### 6. Do you need to package a chart before pushing it to an OCI registry?

> Yes. `helm push` uploads a packaged Helm Chart (`.tgz`), so the chart must first be packaged using `helm package`.

---

# 📌 Key Takeaways

- OCI (Open Container Initiative) enables Helm Charts to be stored in modern container registries.
- OCI registries eliminate the need for `index.yaml`, simplifying chart distribution.
- Use `helm registry login` to authenticate with private registries.
- Charts must be packaged (`.tgz`) before they can be pushed.
- Helm supports pushing, pulling, installing, and upgrading charts directly from OCI registries.
- OCI registries allow Docker images and Helm Charts to coexist in a single artifact repository.
- OCI is the recommended approach for modern, enterprise-grade Helm chart distribution and CI/CD pipelines.