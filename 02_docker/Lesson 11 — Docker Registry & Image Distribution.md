# Lesson 11 — Docker Registry & Image Distribution

## Overview

So far you've learned how to:

```text
Dockerfile
    │
    ▼
Build Image
    │
    ▼
Run Container
```

But how do you share Docker images between:

- Developers
- CI/CD pipelines
- Staging environments
- Production servers

The answer is a **Docker Registry**.

---

# What Is a Docker Registry?

A **Docker Registry** is a service that stores and distributes Docker images.

Think of it like this:

```text
GitHub
   │
   ▼
Stores Source Code

Docker Registry
      │
      ▼
Stores Docker Images
```

Instead of sharing source code, a registry shares **container images**.

---

# Popular Docker Registries

## Public Registries

- Docker Hub
- GitHub Container Registry (GHCR)

## Cloud Registries

- Amazon Elastic Container Registry (ECR)
- Google Artifact Registry
- Azure Container Registry (ACR)

## Self-Hosted Registries

- Harbor
- Docker Registry

---

# Docker Hub

Docker Hub is Docker's default public registry.

Search for images:

```bash
docker search nginx
```

Pull an image:

```bash
docker pull nginx
```

If no registry is specified, Docker automatically pulls from **Docker Hub**.

---

# Image Naming Structure

A Docker image name consists of:

```text
repository:tag
```

Examples:

```text
nginx:1.27
node:20
redis:8
```

---

# Full Registry Format

When specifying a registry explicitly:

```text
registry/repository:tag
```

Example:

```text
docker.io/library/nginx:1.27
```

Components:

| Component | Description |
|-----------|-------------|
| Registry | Where the image is stored |
| Repository | Image name |
| Tag | Image version |

---

# Tagging Images

Build an image:

```bash
docker build -t myapp:v1 .
```

View available images:

```bash
docker images
```

Example output:

```text
REPOSITORY   TAG
myapp        v1
```

---

# Multiple Tags

A single image can have multiple tags.

Example:

```bash
docker tag myapp:v1 myapp:latest
```

View them:

```bash
docker images
```

Both tags reference the same image ID.

---

# Why Tags Matter

### ❌ Bad Practice

```text
latest
```

### ✅ Better Practice

```text
v1.0.0
v1.0.1
v1.1.0
v2.0.0
```

Versioned tags make deployments predictable and simplify rollbacks.

---

# Semantic Versioning

Docker images commonly follow **Semantic Versioning (SemVer)**.

Format:

```text
MAJOR.MINOR.PATCH
```

Example:

```text
1.4.7
```

Meaning:

| Part | Purpose |
|------|---------|
| Major | Breaking changes |
| Minor | New features |
| Patch | Bug fixes |

---

# Login to a Registry

Authenticate with a registry:

```bash
docker login
```

Provide:

- Username
- Password or Access Token

Docker stores credentials locally.

Linux/macOS:

```bash
cat ~/.docker/config.json
```

---

# Push an Image to Docker Hub

Assume your Docker Hub username is:

```text
hatimdev
```

Tag the image:

```bash
docker tag myapp:v1 hatimdev/myapp:v1
```

Push it:

```bash
docker push hatimdev/myapp:v1
```

The image is now available in your Docker Hub repository.

---

# Pull Your Image

Download the image from any machine:

```bash
docker pull hatimdev/myapp:v1
```

Run it:

```bash
docker run hatimdev/myapp:v1
```

This demonstrates how registries distribute images across environments.

---

# Image Digests

Tags can change over time.

Digests cannot.

Example:

```text
nginx@sha256:abc123...
```

A digest uniquely identifies the exact image content.

Production systems often deploy images using **digests** instead of tags to ensure consistency.

---

# View an Image Digest

Inspect an image:

```bash
docker inspect nginx
```

Look for:

```text
RepoDigests
```

---

# Re-Tag an Existing Image

Create another tag for the same image:

```bash
docker tag myapp:v1 myapp:prod
```

Now both tags point to the same image:

```text
v1
prod
```

No additional image is created.

---

# Private Registries

Not every image should be public.

Private registries are commonly used for:

- Internal applications
- Proprietary software
- Enterprise deployments

Authentication is required to access private images.

---

# Run Your Own Docker Registry

Start a local registry:

```bash
docker run -d \
  -p 5000:5000 \
  --name registry \
  registry:2
```

Your local registry is available at:

```text
localhost:5000
```

---

# Push to a Local Registry

Tag the image:

```bash
docker tag myapp:v1 localhost:5000/myapp:v1
```

Push it:

```bash
docker push localhost:5000/myapp:v1
```

---

# Pull from a Local Registry

```bash
docker pull localhost:5000/myapp:v1
```

Useful for local development and internal networks.

---

# Docker Registry in CI/CD

A typical deployment pipeline:

```text
Git Push
    │
    ▼
CI Pipeline
    │
    ▼
Docker Build
    │
    ▼
Push to Registry
    │
    ▼
Deploy
```

Most modern DevOps workflows follow this pattern.

---

# Example GitHub Actions Workflow

```text
Source Code
     │
     ▼
Build Docker Image
     │
     ▼
Push to GHCR
     │
     ▼
Deploy to Kubernetes
```

This is a common production workflow.

---

# Registry Cleanup

Remove a local image:

```bash
docker rmi myapp:v1
```

Pull it again:

```bash
docker pull hatimdev/myapp:v1
```

This verifies that the registry successfully stores and distributes the image.

---

# Best Practices

## Avoid Using Only `latest`

### ❌ Bad

```text
myapp:latest
```

### ✅ Good

```text
myapp:v1.0.0
myapp:v1.0.1
myapp:v1.1.0
```

---

## Use Immutable Releases

Never overwrite production image tags.

Good example:

```text
v1.0.0
v1.0.1
v1.0.2
```

Each version represents a permanent release.

---

## Scan Images Before Publishing

Scan images for vulnerabilities before pushing them to a registry.

Popular tools:

- Trivy
- Docker Scout

---

## Keep Images Small

Smaller images provide:

- Faster downloads
- Faster deployments
- Lower storage costs
- Reduced attack surface

---

## Sign Images

Production environments often require image signing to verify authenticity.

Popular tools:

- Cosign
- Notary

Image signing helps prevent tampering and supply chain attacks.

---

# Common Interview Questions

## What is the difference between an image tag and an image digest?

| Tag | Digest |
|------|---------|
| Human-readable | SHA-256 hash |
| Mutable | Immutable |
| Can be reassigned | Always points to the same image |

---

## Why should you avoid `latest` in production?

Because `latest` can change over time, making deployments unpredictable and difficult to roll back.

---

## What is a Docker Registry?

A Docker Registry is a service that stores, manages, and distributes container images.

---

## What is the difference between Docker Hub and a private registry?

| Docker Hub | Private Registry |
|------------|------------------|
| Public by default | Access controlled |
| Suitable for open-source images | Used for internal applications |
| Managed by Docker | Can be self-hosted or cloud-managed |

---

## Why use image versioning?

Image versioning provides:

- Predictable deployments
- Easy rollbacks
- Better release tracking
- Reproducible environments

---

# Key Takeaways

By the end of this lesson, you should understand:

- Docker Registries
- Docker Hub
- Image naming conventions
- Tags vs Digests
- Semantic Versioning
- Pushing and pulling images
- Private registries
- Self-hosted registries
- Registry integration with CI/CD
- Image distribution best practices
- Production image versioning
- Image signing and security