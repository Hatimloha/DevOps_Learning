# Lesson 10 — Docker Optimization & Performance

## Overview

Docker optimization focuses on building **smaller, faster, and more secure container images**. Optimized images improve build performance, reduce deployment time, lower storage and bandwidth usage, and decrease security risks.

---

# Why Optimization Matters

Without optimization, Docker images can become unnecessarily large, leading to:

- Large image sizes
- Slow CI/CD pipelines
- Longer deployment times
- Higher bandwidth consumption
- More security vulnerabilities
- Increased cloud infrastructure costs

### Example

Without optimization:

```text
500 MB Image
     │
     ▼
Slow Pull
     │
     ▼
Slow Deployment
```

With optimization:

```text
60 MB Image
    │
    ▼
Fast Pull
    │
    ▼
Fast Deployment
```

---

# Optimize Base Images

Choosing the right base image has a significant impact on image size and security.

| Base Image | Approx. Size | Best For |
|------------|--------------|----------|
| Ubuntu | Large | General-purpose Linux |
| Debian | Medium | Stable applications |
| Alpine | Small | Lightweight applications |
| Distroless | Very Small | Production environments |

### Recommended

```dockerfile
FROM node:20-alpine
```

Instead of:

```dockerfile
FROM node:20
```

> **Note:** Alpine uses **musl** instead of **glibc**. Always verify compatibility with your application's dependencies.

---

# Use Multi-Stage Builds

### ❌ Bad Example

```dockerfile
FROM node:20

WORKDIR /app

COPY . .

RUN npm install
RUN npm run build

CMD ["npm", "start"]
```

The final image contains:

- Source code
- Build tools
- npm cache
- Development dependencies

---

### ✅ Better Example

```dockerfile
FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
```

Only the compiled application is copied into the final image.

### Benefits

- Smaller images
- Faster deployments
- Improved security
- Build tools excluded from production

---

# Master Docker Build Cache

Docker caches image layers to avoid rebuilding unchanged steps.

### Good Layer Order

```dockerfile
COPY package*.json ./
RUN npm ci

COPY . .
```

If only the application code changes:

- `npm ci` is reused from cache.
- Only the final `COPY` layer rebuilds.

---

### Bad Layer Order

```dockerfile
COPY . .
RUN npm ci
```

Every code change invalidates the dependency cache, forcing `npm ci` to run again.

---

# Combine RUN Instructions

### ❌ Bad

```dockerfile
RUN apt update
RUN apt install -y curl
RUN apt install -y git
```

Creates **three image layers**.

---

### ✅ Better

```dockerfile
RUN apt update && \
    apt install -y curl git && \
    rm -rf /var/lib/apt/lists/*
```

Creates **one optimized layer**.

---

# Clean Package Cache

### ❌ Bad

```dockerfile
RUN apt install -y curl
```

APT package cache remains in the image.

---

### ✅ Better

```dockerfile
RUN apt update && \
    apt install -y curl && \
    rm -rf /var/lib/apt/lists/*
```

Removes unnecessary package metadata and reduces image size.

---

# Use `.dockerignore`

Exclude files that are not required during image builds.

Example:

```text
.git
node_modules
coverage
dist
.env
*.log
```

### Benefits

- Faster builds
- Smaller build context
- Reduced memory usage

---

# Use `npm ci` Instead of `npm install`

For production builds:

```dockerfile
RUN npm ci
```

### Advantages

- Faster installation
- Deterministic builds
- Uses `package-lock.json`
- Better suited for CI/CD

---

# Install Production Dependencies Only

Exclude development dependencies from production images.

```dockerfile
RUN npm ci --omit=dev
```

This reduces image size and minimizes the attack surface.

---

# Avoid Installing Unnecessary Packages

### ❌ Bad

```dockerfile
RUN apt install vim nano curl git wget python
```

---

### ✅ Good

```dockerfile
RUN apt install curl
```

Install **only** what the application requires.

---

# Minimize Image Layers

Every Dockerfile instruction creates a new layer.

### ❌ Less Efficient

```dockerfile
RUN mkdir app
RUN cd app
RUN touch file.txt
```

---

### ✅ Better

```dockerfile
WORKDIR /app

RUN touch file.txt
```

Fewer layers result in smaller and more efficient images.

---

# Inspect Docker Images

View image sizes:

```bash
docker images
```

Inspect image layers:

```bash
docker history myimage
```

Useful for identifying unnecessary layers.

---

# Measure Build Time

Build without cache:

```bash
docker build --no-cache -t myapp .
```

Normal build:

```bash
docker build -t myapp .
```

Compare the execution times to evaluate caching efficiency.

---

# BuildKit

BuildKit is Docker's modern build engine.

### Benefits

- Faster builds
- Improved caching
- Parallel execution
- Secret mounts
- SSH forwarding

Enable BuildKit temporarily:

```bash
DOCKER_BUILDKIT=1 docker build .
```

Or configure BuildKit as the default build engine.

---

# Docker Buildx

Buildx extends Docker's build capabilities.

### Features

- Multi-platform image builds
- Advanced BuildKit support
- Improved caching
- Cross-platform image creation

Example:

```bash
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t myapp:latest .
```

Ideal for building images targeting:

- Intel (x86_64)
- AMD
- Apple Silicon (M-series)
- ARM servers

---

# Cross-Platform Images

A single image can support multiple CPU architectures.

Supported examples:

```text
linux/amd64
linux/arm64
linux/arm/v7
```

Useful for:

- Cloud deployments
- Kubernetes clusters
- Raspberry Pi devices
- Apple Silicon systems

---

# Reduce Attack Surface

Smaller images include:

- Fewer packages
- Fewer vulnerabilities
- Fewer known CVEs

Optimization improves both **performance** and **security**.

---

# Resource Limits

Limit container memory:

```bash
docker run -m 512m myapp
```

Limit CPU usage:

```bash
docker run --cpus=2 myapp
```

Resource limits prevent containers from consuming excessive system resources.

---

# Startup Performance

### ❌ Poor Startup

```text
Container Starts
      │
      ▼
Downloads Dependencies
      │
      ▼
Application Starts
```

---

### ✅ Optimized Startup

```text
Container Starts
      │
      ▼
Dependencies Already Included
      │
      ▼
Application Starts Immediately
```

Applications should be fully prepared during the image build process.

---

# Monitor Resource Usage

View live container statistics:

```bash
docker stats
```

Displays:

- CPU usage
- Memory usage
- Network I/O
- Block I/O

---

# Analyze Docker Disk Usage

View Docker resource usage:

```bash
docker system df
```

Displays:

- Images
- Containers
- Volumes
- Build cache

---

# Clean Up Unused Resources

Remove stopped containers:

```bash
docker container prune
```

Remove unused images:

```bash
docker image prune
```

Remove unused volumes:

```bash
docker volume prune
```

Remove all unused resources:

```bash
docker system prune
```

Remove everything, including unused volumes:

```bash
docker system prune -a --volumes
```

> **Warning:** These commands permanently delete unused Docker resources.

---

# Production Dockerfile Example

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

USER node

EXPOSE 3000

CMD ["node", "server.js"]
```

### Why This Dockerfile Is Good

- Lightweight Alpine base image
- Cached dependency layer
- Production dependencies only
- Runs as a non-root user
- Minimal image layers
- Better security

---

# Docker Optimization Checklist

Before publishing an image, verify:

- ✅ Use a small base image
- ✅ Use multi-stage builds
- ✅ Configure `.dockerignore`
- ✅ Use `npm ci`
- ✅ Install production dependencies only
- ✅ Run as a non-root user
- ✅ Combine `RUN` instructions
- ✅ Remove package caches
- ✅ Pin image versions
- ✅ Add a health check (when appropriate)

---

# Common Interview Questions

### Why are Docker layers important?

Docker layers enable:

- Faster rebuilds
- Efficient image caching
- Reduced storage usage
- Layer reuse across images

---

### Why use multi-stage builds?

To separate build dependencies from the final production image, resulting in:

- Smaller images
- Better security
- Faster deployments

---

### Why use `.dockerignore`?

To prevent unnecessary files from being included in the build context, improving build speed and reducing image size.

---

### Why use BuildKit?

BuildKit provides:

- Faster builds
- Smarter caching
- Parallel execution
- Secret management
- Multi-platform support

---

### Why use `npm ci`?

`npm ci` installs dependencies directly from `package-lock.json`, providing:

- Faster installations
- Reproducible builds
- Reliable CI/CD pipelines

---

# Key Takeaways

By the end of this lesson, you should understand:

- Choosing the right base image
- Multi-stage builds
- Docker layer caching
- Optimizing Dockerfiles
- BuildKit and Buildx
- Cross-platform image creation
- Resource limits
- Startup optimization
- Docker cleanup commands
- Production-ready Docker best practices