# Lesson 13 — BuildKit & Buildx (Advanced Docker Builds)

## Overview

Docker image building started with the classic Docker builder.

Modern Docker uses:

```text
Docker Build
      │
      ▼
BuildKit
      │
      ▼
Buildx
```

These technologies make Docker builds:

- Faster
- Smarter
- More secure
- Multi-platform capable

---

# 1. Traditional Docker Build

The traditional workflow:

```bash
docker build -t myapp .
```

Old builder process:

```text
Dockerfile
    │
    ▼
Execute instructions one by one
    │
    ▼
Create layers
    │
    ▼
Generate Docker image
```

## Problems With The Old Builder

- Slow builds
- Limited caching
- No parallel execution
- Poor multi-platform support

---

# 2. What Is BuildKit?

**BuildKit** is Docker's next-generation build engine.

It replaces the legacy Docker builder.

Architecture:

```text
Docker CLI

    │

    ▼

BuildKit

    │

    ▼

LLB Build Graph

    │

    ▼

Image Layers
```

---

# BuildKit Benefits

## 1. Parallel Build Execution

### Old Builder

Steps execute sequentially:

```text
Step 1
  │
  ▼
Step 2
  │
  ▼
Step 3
```

---

### BuildKit

Independent steps can execute together:

```text
Step 1 ──┐
         │
         ├── Build Together
         │
Step 2 ──┘
```

This reduces build time.

---

# 2. Better Cache Management

BuildKit understands:

- Dependencies
- Changed files
- Reusable layers

Example Dockerfile:

```dockerfile
FROM node:20

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

CMD ["npm", "start"]
```

If only application code changes:

```dockerfile
COPY . .
```

changes.

But:

```dockerfile
RUN npm install
```

remains cached.

This avoids unnecessary dependency installation.

---

# Enable BuildKit

## Linux/macOS

```bash
DOCKER_BUILDKIT=1 docker build -t myapp .
```

---

## Windows PowerShell

```powershell
$env:DOCKER_BUILDKIT=1

docker build -t myapp .
```

---

# Check Build Output

## Old Builder Output

```text
Step 1/5
Step 2/5
Step 3/5
```

---

## BuildKit Output

```text
[+] Building

 => [internal]
 => [builder]
 => exporting image
```

---

# 3. Buildx

**Buildx** is a Docker CLI extension that uses BuildKit.

Think of it like:

```text
BuildKit = Build Engine

Buildx = CLI Interface
```

Buildx exposes advanced BuildKit features.

---

# Check Buildx Version

```bash
docker buildx version
```

---

# List Available Builders

```bash
docker buildx ls
```

Example:

```text
NAME/NODE

default
docker-container
```

---

# Create a Builder

```bash
docker buildx create \
--name mybuilder \
--use
```

Verify:

```bash
docker buildx ls
```

---

# Build Using Buildx

```bash
docker buildx build \
-t myapp:v1 .
```

---

# 4. Multi-Platform Images

One of the biggest Buildx features is building images for multiple CPU architectures.

Modern systems use different CPUs:

- Intel servers
- AMD servers
- ARM servers
- Apple Silicon

Common architectures:

```text
linux/amd64
linux/arm64
linux/arm/v7
```

---

# The Problem

Example:

Your development machine:

```text
Mac M-series
```

Architecture:

```text
ARM64
```

Builds:

```text
ARM64 image
```

But production server:

```text
Intel CPU
```

Needs:

```text
AMD64 image
```

---

# Solution: Multi-Platform Build

```bash
docker buildx build \
--platform linux/amd64,linux/arm64 \
-t myapp:v1 .
```

Creates:

```text
myapp:v1

├── linux/amd64
└── linux/arm64
```

---

# Push Multi-Platform Images

Multi-platform images usually need a registry.

Example:

```bash
docker buildx build \
--platform linux/amd64,linux/arm64 \
-t username/myapp:v1 \
--push .
```

The registry stores both architectures.

---

# 5. Build Cache Export

BuildKit can store cache externally.

This is extremely useful for CI/CD pipelines.

Example:

```bash
docker buildx build \
--cache-to type=registry \
--cache-from type=registry \
-t myapp .
```

Benefits:

- Faster CI builds
- Shared cache between runners
- Reduced build time

---

# 6. Secret Management During Build

Never store secrets inside Dockerfiles.

---

## ❌ Bad Example

```dockerfile
ENV PASSWORD=mysecret
```

Problem:

The secret becomes part of image layers.

Anyone with access to the image may extract it.

---

# BuildKit Secret Mount

Pass secret during build:

```bash
docker build \
--secret id=mysecret,src=password.txt .
```

Dockerfile:

```dockerfile
RUN --mount=type=secret,id=mysecret \
cat /run/secrets/mysecret
```

The secret:

- Exists only during build
- Is not stored in the image
- Does not appear in image history

---

# 7. SSH Forwarding

Useful when cloning private repositories during builds.

Example:

```bash
docker build \
--ssh default .
```

Dockerfile:

```dockerfile
RUN --mount=type=ssh git clone private-repo
```

SSH credentials are forwarded temporarily.

They never enter the final image.

---

# 8. Build Output Control

## Build Only

```bash
docker buildx build .
```

---

## Load Image Locally

```bash
docker buildx build \
--load \
-t myapp .
```

Allows:

```bash
docker images
```

to show the image locally.

---

## Push Directly To Registry

```bash
docker buildx build \
--push \
-t registry/myapp .
```

Builds and uploads the image.

---

# 9. Docker Bake

Docker Bake is an advanced Buildx feature.

It manages complex builds.

Instead of running many commands:

```bash
docker buildx bake
```

Uses:

```text
docker-bake.hcl
```

Example:

```hcl
target "app" {
    dockerfile = "Dockerfile"
    tags = ["myapp:v1"]
}
```

Useful for:

- Monorepos
- Multiple images
- Large projects
- Complex CI/CD pipelines

---

# BuildKit Security Improvements

BuildKit improves:

- Secret handling
- Build isolation
- Reproducible builds
- Reduced build context
- Secure credential usage

---

# Real CI/CD Example

Production workflow:

```text
Developer Push Code

        │

        ▼

GitHub Actions

        │

        ▼

docker buildx build

        │

        ▼

Multi-platform Image

        │

        ▼

Push Registry

        │

        ▼

Deploy Kubernetes
```

---

# Production Build Example

```bash
docker buildx build \
--platform linux/amd64,linux/arm64 \
-t company/api:v1.0.0 \
--cache-from type=registry \
--cache-to type=registry \
--push .
```

This is a common production pattern.

---

# Common Interview Questions

## What is BuildKit?

BuildKit is Docker's modern build engine that provides:

- Faster builds
- Better caching
- Parallel execution
- Advanced security features

---

## Difference Between BuildKit and Buildx?

| BuildKit | Buildx |
|----------|--------|
| Build engine | CLI tool |
| Executes builds | Provides BuildKit features |
| Internal technology | User interface |

---

## Why use Buildx?

Buildx provides:

- Multi-platform builds
- Advanced caching
- Remote builders
- CI/CD optimization

---

## How do you build ARM and AMD images?

Using:

```bash
docker buildx build \
--platform linux/amd64,linux/arm64
```

---

## Why should secrets not be stored in Dockerfiles?

Because:

- They become part of image layers
- They can be extracted
- They create security risks

Use BuildKit secret mounts instead.

---

# Key Takeaways

By the end of this lesson, you should understand:

- Traditional Docker builder limitations
- BuildKit architecture
- Buildx capabilities
- Advanced Docker caching
- Multi-platform image builds
- Registry cache usage
- Secure secret handling
- SSH forwarding
- Docker Bake
- Production-grade Docker build workflows