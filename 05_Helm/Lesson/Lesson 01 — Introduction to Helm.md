# 🚀 Helm Tutorial — Lesson 1: Introduction to Helm

> A beginner-friendly guide to understanding Helm, the package manager for Kubernetes.

---

## 📚 Table of Contents

- [What is Helm?](#-what-is-helm)
- [Why Helm?](#-why-helm)
- [Core Concepts](#-core-concepts)
- [Helm Architecture](#-helm-architecture)
- [Install Helm](#-install-helm)
- [Common Helm Commands](#-common-helm-commands)
- [Interview Questions](#-interview-questions)
- [Real-World Usage](#-real-world-usage)
- [Key Takeaways](#-key-takeaways)

---

# 📦 What is Helm?

**Helm** is the **Package Manager for Kubernetes**.

Think of Helm as the Kubernetes equivalent of package managers used in other technologies.

| Technology | Package Manager |
|------------|-----------------|
| Ubuntu | `apt` |
| RHEL | `yum` |
| Node.js | `npm` |
| Python | `pip` |
| Kubernetes | **Helm** |

---

# ❌ Deploying Without Helm

Without Helm, every Kubernetes resource must be applied individually.

```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f ingress.yaml
kubectl apply -f configmap.yaml
kubectl apply -f secret.yaml
```

For enterprise applications, you may have:

- 50+ YAML files
- 100+ YAML files
- 200+ YAML files

Managing and updating these files manually quickly becomes difficult.

---

# ✅ Why Helm?

Helm packages all Kubernetes resources into a single reusable package called a **Chart**.

Instead of manually downloading, editing, and applying multiple YAML files, Helm lets you install an application with a single command.

### Without Helm

- Download YAML files
- Edit configurations
- Apply resources manually
- Upgrade manually
- Rollback manually

### With Helm

```bash
helm install nginx oci://registry-1.docker.io/bitnamicharts/nginx
```

One command installs the complete application.

---

# 📖 Core Concepts

## 1️⃣ Chart

A **Chart** is a packaged Kubernetes application.

Example directory:

```text
nginx-chart/
```

A chart typically contains:

- Deployment
- Service
- Ingress
- ConfigMap
- Secret
- Other Kubernetes resources

Everything required to deploy an application is packaged together.

---

## 2️⃣ Release

A **Release** is an installed instance of a Helm Chart.

Example:

```bash
helm install my-nginx nginx-chart
```

Here:

| Item | Value |
|------|-------|
| Release Name | `my-nginx` |
| Chart | `nginx-chart` |

You can install the same chart multiple times with different release names.

```bash
helm install dev-nginx nginx-chart

helm install prod-nginx nginx-chart
```

Each release is managed independently.

---

## 3️⃣ Repository

A **Repository** is a collection of Helm Charts.

Just like Docker Hub stores Docker images, Helm repositories store Helm charts.

| Docker | Helm |
|---------|------|
| Docker Hub | Helm Repository |
| Docker Image | Helm Chart |

Popular repositories include:

- Bitnami
- CNCF
- Grafana Labs

---

# 🏗️ Helm Architecture

```text
Developer
    │
    ▼
 Helm CLI
    │
    ▼
Kubernetes API
    │
    ▼
Kubernetes Cluster
```

> **Note:** Helm does **not** replace Kubernetes.

Helm communicates with the Kubernetes API to create, update, and manage Kubernetes resources.

---

# ⚙️ Install Helm

### Linux

```bash
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

Verify the installation:

```bash
helm version
```

Example output:

```bash
version.BuildInfo{
  Version:"v3.21.1",
  GitCommit:"c56dd0095fd76da5d7b30ecdf506103e7f26745e",
  GitTreeState:"clean",
  GoVersion:"go1.26.4"
}
```

---

# 🛠️ Common Helm Commands

## Check Helm Version

```bash
helm version
```

---

## Search Charts

```bash
helm search hub nginx
```

---

## Add a Repository

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
```

---

## Update Repositories

```bash
helm repo update
```

---

## Install a Chart

```bash
helm install my-nginx bitnami/nginx
```

---

## List Installed Releases

```bash
helm list
```

---

## Uninstall a Release

```bash
helm uninstall my-nginx
```

---

# 🎯 Interview Questions

### What is Helm?

> Helm is the package manager for Kubernetes that simplifies deploying and managing Kubernetes applications.

---

### What is a Chart?

> A packaged Kubernetes application containing all required resource definitions.

---

### What is a Release?

> A running or installed instance of a Helm Chart inside a Kubernetes cluster.

---

### What is a Repository?

> A storage location that hosts and distributes Helm Charts.

---

### Why do we use Helm?

- Reusability
- Version control
- Easy upgrades
- Rollbacks
- Templating
- Faster deployments
- Simplified application management

---

# 🌍 Real-World Usage

Helm is widely used in production Kubernetes environments to deploy and manage applications such as:

- Jenkins
- Prometheus
- Grafana
- Argo CD
- NGINX Ingress Controller
- Elasticsearch
- Kafka
- Redis
- PostgreSQL

Managing hundreds of raw YAML files manually is impractical, which is why Helm has become the standard deployment tool for Kubernetes applications.

---

# 📌 Key Takeaways

- Helm is the **package manager for Kubernetes**.
- A **Chart** packages Kubernetes resources into a reusable application.
- A **Release** is an installed instance of a Chart.
- A **Repository** stores Helm Charts.
- Helm simplifies installation, upgrades, rollbacks, and version management.
- Most production Kubernetes environments rely on Helm for deploying applications.

---

